import { VirusTotalAPI } from '../integrations/virusTotalAPI';
import db from '../config/database';
import { APIError } from '../types/errors';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { io } from '../app';
import { emitScanUpdate } from '../socket';

export interface FileScanResult {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    hash: {
        md5: string;
        sha1: string;
        sha256: string;
    };
    scanId: string;
    scanDate: string;
    permalink?: string;
    status: string;
    stats?: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout?: number;
    };
    results?: any;
    signatures?: any[];
}

export class FileScanService {
    private vtApi: VirusTotalAPI;
    private uploadDir: string;

    constructor(apiKey: string) {
        this.vtApi = new VirusTotalAPI(apiKey);
        
        // Create temp directory for file uploads if it doesn't exist
        this.uploadDir = path.join(os.tmpdir(), 'tlascanner-uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Save an uploaded file to the temporary directory
     * @param fileBuffer The file buffer
     * @param fileName Original file name
     * @returns Path to the saved file
     */
    private async saveUploadedFile(fileBuffer: Buffer, fileName: string): Promise<string> {
        // Generate a unique filename to prevent collisions
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
        const tempFilePath = path.join(this.uploadDir, `${uniqueId}-${sanitizedFileName}`);
        
        await fs.promises.writeFile(tempFilePath, fileBuffer);
        return tempFilePath;
    }

    /**
     * Scan a file using VirusTotal API
     * @param fileBuffer The file buffer
     * @param fileName Original file name
     * @param fileSize File size in bytes
     * @param fileType MIME type of the file
     * @param clientInfo Client information (IP, user agent)
     * @returns Scan result with ID
     */
    async scanFile(
        fileBuffer: Buffer, 
        fileName: string, 
        fileSize: number, 
        fileType: string,
        clientInfo: { ip: string; userAgent: string }
    ): Promise<FileScanResult> {
        try {
            // Save file temporarily
            const tempFilePath = await this.saveUploadedFile(fileBuffer, fileName);
            
            // Calculate file hashes
            const hashes = await this.vtApi.calculateFileHashes(tempFilePath);
            
            // Check if file has been scanned before in our database
            const existingLocalReport = await this.getReportByHash(hashes.sha256);
            if (existingLocalReport) {
                // Clean up temp file
                await fs.promises.unlink(tempFilePath);
                
                // Emit WebSocket event for existing report
                emitScanUpdate(io, existingLocalReport.scanId, {
                    status: existingLocalReport.status,
                    results: existingLocalReport
                });
                
                return existingLocalReport;
            }
            
            // Check if file exists in VirusTotal's database
            const vtReport = await this.vtApi.getFileReportByHash(hashes.sha256);
            let scanId: string;
            let initialStatus = 'pending';
            let initialStats: { harmless: number; malicious: number; suspicious: number; undetected: number; timeout: number } = 
                { harmless: 0, malicious: 0, suspicious: 0, undetected: 0, timeout: 0 };
            let initialResults: Record<string, any> = {};
            let permalink = '';
            
            if (vtReport && vtReport.data) {
                // File exists in VirusTotal database, use the existing analysis ID
                scanId = vtReport.data.id;
                permalink = `https://www.virustotal.com/gui/file/${hashes.sha256}`;
                
                // Check if there are last_analysis_results available
                if (vtReport.data.attributes && vtReport.data.attributes.last_analysis_results) {
                    initialStatus = 'completed';
                    
                    // Calculate stats from the results
                    const results = vtReport.data.attributes.last_analysis_results;
                    initialResults = { ...results } as Record<string, any>;
                    
                    // Extract threat signatures from results
                    const signatures = this.extractThreatSignatures(results, vtReport.data.attributes);
                    if (signatures && signatures.length > 0) {
                        initialResults.signatures = signatures;
                    }
                    
                    // Count results by category
                    initialStats = Object.values(results).reduce((stats: { 
                        harmless: number; 
                        malicious: number; 
                        suspicious: number; 
                        undetected: number; 
                        timeout: number 
                    }, result: any) => {
                        if (result.category) {
                            const category = result.category as string;
                            if (category === 'harmless' || 
                                category === 'malicious' || 
                                category === 'suspicious' || 
                                category === 'undetected' || 
                                category === 'timeout') {
                                stats[category] = (stats[category] || 0) + 1;
                            }
                        }
                        return stats;
                    }, { harmless: 0, malicious: 0, suspicious: 0, undetected: 0, timeout: 0 });
                    
                    // Ensure all required stats properties exist
                    initialStats.harmless = initialStats.harmless || 0;
                    initialStats.malicious = initialStats.malicious || 0;
                    initialStats.suspicious = initialStats.suspicious || 0;
                    initialStats.undetected = initialStats.undetected || 0;
                    initialStats.timeout = initialStats.timeout || 0;
                }
                
                // Still initiate a fresh scan in the background to get the latest results
                this.vtApi.uploadFileBuffer(fileBuffer, fileName).catch(error => {
                    console.log('Background scan initiation error (non-critical):', error.message);
                });
            } else {
                // File doesn't exist in VirusTotal, upload it for scanning
                const uploadResponse = await this.vtApi.uploadFileBuffer(fileBuffer, fileName);
                scanId = uploadResponse.data.id;
                permalink = `https://www.virustotal.com/api/v3/analyses/${scanId}`;
                initialResults = {}; // Initialize as empty object to prevent TypeScript errors
            }
            
            // Create a record in the database with whatever information we have
            const result = await this.createFileScanRecordWithResults({
                fileName,
                fileSize,
                fileType,
                hash: hashes,
                scanId,
                status: initialStatus,
                permalink,
                stats: initialStats,
                results: initialResults,
                clientInfo
            });
            
            // Clean up temp file
            await fs.promises.unlink(tempFilePath);
            
            // Start background polling for scan results if status is pending
            if (result.status === 'pending') {
                this.startBackgroundPolling(result.scanId);
            } else {
                // Emit WebSocket event with the results
                emitScanUpdate(io, result.scanId, {
                    status: result.status,
                    results: result
                });
            }
            
            return result;
        } catch (error) {
            console.error('Error scanning file:', error);
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Failed to scan file', 500);
        }
    }

    /**
     * Create a file scan record in the database with optional results
     */
    private async createFileScanRecordWithResults({
        fileName,
        fileSize,
        fileType,
        hash,
        scanId,
        status = 'pending',
        permalink = '',
        stats = null,
        results = null,
        clientInfo
    }: {
        fileName: string;
        fileSize: number;
        fileType: string;
        hash: { md5: string; sha1: string; sha256: string };
        scanId: string;
        status?: string;
        permalink?: string;
        stats?: any;
        results?: any;
        clientInfo: { ip: string; userAgent: string };
    }): Promise<FileScanResult> {
        const query = `
            INSERT INTO file_scans (
                file_name, file_size, file_type, 
                md5_hash, sha1_hash, sha256_hash,
                scan_id, status, permalink, stats, results, ip_address, user_agent
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, file_name, file_size, file_type, 
                     md5_hash, sha1_hash, sha256_hash,
                     scan_id, scan_date, permalink, status, stats, results
        `;
        
        const values = [
            fileName,
            fileSize,
            fileType,
            hash.md5,
            hash.sha1,
            hash.sha256,
            scanId,
            status,
            permalink,
            stats ? JSON.stringify(stats) : null,
            results ? JSON.stringify(results) : null,
            clientInfo.ip,
            clientInfo.userAgent
        ];
        
        const result = await db.query(query, values);
        const record = result.rows[0];
        
        return {
            id: record.id,
            fileName: record.file_name,
            fileSize: record.file_size,
            fileType: record.file_type,
            hash: {
                md5: record.md5_hash,
                sha1: record.sha1_hash,
                sha256: record.sha256_hash
            },
            scanId: record.scan_id,
            scanDate: record.scan_date,
            permalink: record.permalink,
            status: record.status,
            stats: record.stats,
            results: record.results
        };
    }

    /**
     * Get a file scan report by its database ID
     * @param id Database ID of the scan
     * @returns Scan result
     */
    async getReportById(id: string): Promise<FileScanResult | null> {
        const query = `
            SELECT id, file_name, file_size, file_type, 
                   md5_hash, sha1_hash, sha256_hash,
                   scan_id, scan_date, permalink, status, stats, results
            FROM file_scans
            WHERE id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const record = result.rows[0];
        return this.mapDbRecordToResult(record);
    }

    /**
     * Get a file scan report by file hash
     * @param hash SHA-256, SHA-1, or MD5 hash of the file
     * @returns Most recent scan result for the file
     */
    async getReportByHash(hash: string): Promise<FileScanResult | null> {
        const query = `
            SELECT id, file_name, file_size, file_type, 
                   md5_hash, sha1_hash, sha256_hash,
                   scan_id, scan_date, permalink, status, stats, results
            FROM file_scans
            WHERE md5_hash = $1 OR sha1_hash = $1 OR sha256_hash = $1
            ORDER BY scan_date DESC
            LIMIT 1
        `;
        
        const result = await db.query(query, [hash]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const record = result.rows[0];
        return this.mapDbRecordToResult(record);
    }

    /**
     * Get a file scan report by scan ID
     * @param scanId VirusTotal scan ID
     * @returns Scan result
     */
    async getReportByScanId(scanId: string): Promise<FileScanResult | null> {
        const query = `
            SELECT id, file_name, file_size, file_type, 
                   md5_hash, sha1_hash, sha256_hash,
                   scan_id, scan_date, permalink, status, stats, results
            FROM file_scans
            WHERE scan_id = $1
        `;
        
        const result = await db.query(query, [scanId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const record = result.rows[0];
        return this.mapDbRecordToResult(record);
    }

    /**
     * Update the scan results for a file
     * @param scanId VirusTotal scan ID
     * @param analysisResults Analysis results from VirusTotal
     * @returns Updated scan result
     */
    async updateScanResults(scanId: string, analysisResults: any): Promise<FileScanResult | null> {
        // Extract relevant data from the analysis results
        const vtData = analysisResults.data;
        const attributes = vtData.attributes;
        
        // Calculate stats
        const stats = {
            harmless: 0,
            malicious: 0,
            suspicious: 0,
            undetected: 0,
            timeout: 0
        };
        
        if (attributes.stats) {
            stats.harmless = attributes.stats.harmless || 0;
            stats.malicious = attributes.stats.malicious || 0;
            stats.suspicious = attributes.stats.suspicious || 0;
            stats.undetected = attributes.stats.undetected || 0;
            stats.timeout = attributes.stats.timeout || 0;
        }
        
        // Extract threat signatures if there are malicious or suspicious detections
        let resultsWithSignatures = attributes.results || {};
        if ((stats.malicious > 0 || stats.suspicious > 0) && attributes.results) {
            // Extract signatures from the results
            const signatures = this.extractThreatSignatures(attributes.results, attributes);
            if (signatures && signatures.length > 0) {
                resultsWithSignatures = {
                    ...attributes.results,
                    signatures: signatures
                };
            }
        }
        
        // Update the database record
        const query = `
            UPDATE file_scans
            SET status = $1,
                permalink = $2,
                stats = $3,
                results = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE scan_id = $5
            RETURNING id, file_name, file_size, file_type, 
                     md5_hash, sha1_hash, sha256_hash,
                     scan_id, scan_date, permalink, status, stats, results
        `;
        
        const values = [
            attributes.status === 'completed' ? 'completed' : 'pending',
            vtData.links?.self,
            JSON.stringify(stats),
            JSON.stringify(resultsWithSignatures),
            scanId
        ];
        
        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const record = result.rows[0];
        return this.mapDbRecordToResult(record);
    }

    /**
     * Check the status of a pending scan and update if completed
     * @param scanId VirusTotal scan ID
     * @returns Updated scan result
     */
    async checkScanStatus(scanId: string): Promise<FileScanResult | null> {
        try {
            // Get current record
            const currentRecord = await this.getReportByScanId(scanId);
            
            if (!currentRecord || currentRecord.status === 'completed') {
                return currentRecord;
            }
            
            // Get analysis results from VirusTotal
            const analysisResults = await this.vtApi.getFileAnalysisResults(scanId);
            
            // Update the record with the latest results
            const updatedResult = await this.updateScanResults(scanId, analysisResults);
            
            // Emit WebSocket event with the updated results
            if (updatedResult) {
                emitScanUpdate(io, scanId, {
                    status: updatedResult.status,
                    results: updatedResult
                });
            }
            
            return updatedResult;
        } catch (error) {
            console.error('Error checking scan status:', error);
            return null;
        }
    }

    /**
     * Extract threat signatures from scan results
     * @param results The scan results from VirusTotal
     * @param attributes Additional file attributes from VirusTotal
     * @returns Array of threat signatures
     */
    private extractThreatSignatures(results: any, attributes?: any): any[] {
        const signatures: any[] = [];
        
        // Skip if no results
        if (!results) {
            return signatures;
        }
        
        // Process each engine result
        for (const [engine, result] of Object.entries(results)) {
            const engineResult = result as any;
            
            // Only process malicious or suspicious results
            if (engineResult.category !== 'malicious' && engineResult.category !== 'suspicious') {
                continue;
            }
            
            // Skip if no detection name
            if (!engineResult.result) {
                continue;
            }
            
            // Create a threat signature from this detection
            const detectionName = engineResult.result;
            
            // Check if we already have a signature with this name
            const existingSignature = signatures.find(s => s.name === detectionName);
            if (existingSignature) {
                // Add this engine to the existing signature's engines list
                if (!existingSignature.engines) {
                    existingSignature.engines = [];
                }
                existingSignature.engines.push(engine);
                continue;
            }
            
            // Create a new signature
            const signature: any = {
                type: this.determineThreatType(detectionName),
                name: detectionName,
                description: `${detectionName} detected by ${engine}`,
                severity: engineResult.category === 'malicious' ? 'high' : 'medium',
                engines: [engine]
            };
            
            // Try to extract malware family from detection name
            const family = this.extractMalwareFamily(detectionName);
            if (family) {
                signature.family = family;
            }
            
            signatures.push(signature);
        }
        
        // Add additional information from popular engines if available
        if (attributes && attributes.popular_threat_classification) {
            const threatInfo = attributes.popular_threat_classification;
            
            // Add suggested threat names
            if (threatInfo.suggested_threat_label) {
                // If we don't have any signatures yet, create one from the suggested label
                if (signatures.length === 0) {
                    signatures.push({
                        type: this.determineThreatType(threatInfo.suggested_threat_label),
                        name: threatInfo.suggested_threat_label,
                        description: `Identified as ${threatInfo.suggested_threat_label}`,
                        severity: 'high',
                        family: this.extractMalwareFamily(threatInfo.suggested_threat_label)
                    });
                } else {
                    // Update existing signatures with better information
                    for (const signature of signatures) {
                        if (!signature.family) {
                            signature.family = this.extractMalwareFamily(threatInfo.suggested_threat_label);
                        }
                    }
                }
            }
            
            // Add MITRE ATT&CK information if available
            if (attributes.sandbox_verdicts) {
                for (const verdict of Object.values(attributes.sandbox_verdicts)) {
                    const sandboxVerdict = verdict as any;
                    if (sandboxVerdict.category === 'malicious' && sandboxVerdict.malware_classification) {
                        // Add to existing signatures or create a new one
                        if (signatures.length === 0) {
                            signatures.push({
                                type: 'Malicious Behavior',
                                name: sandboxVerdict.malware_names?.[0] || 'Malicious Behavior',
                                description: sandboxVerdict.description || 'Malicious behavior detected in sandbox analysis',
                                severity: 'high',
                                details: sandboxVerdict.description
                            });
                        } else {
                            // Add details to the first signature
                            if (sandboxVerdict.description && !signatures[0].details) {
                                signatures[0].details = sandboxVerdict.description;
                            }
                        }
                    }
                }
            }
        }
        
        return signatures;
    }
    
    /**
     * Determine the type of threat from a detection name
     */
    private determineThreatType(detectionName: string): string {
        const lowerName = detectionName.toLowerCase();
        
        if (lowerName.includes('trojan')) return 'Trojan';
        if (lowerName.includes('worm')) return 'Worm';
        if (lowerName.includes('backdoor')) return 'Backdoor';
        if (lowerName.includes('ransomware')) return 'Ransomware';
        if (lowerName.includes('spyware')) return 'Spyware';
        if (lowerName.includes('adware')) return 'Adware';
        if (lowerName.includes('rootkit')) return 'Rootkit';
        if (lowerName.includes('keylogger')) return 'Keylogger';
        if (lowerName.includes('exploit')) return 'Exploit';
        if (lowerName.includes('dropper')) return 'Dropper';
        if (lowerName.includes('downloader')) return 'Downloader';
        if (lowerName.includes('miner') || lowerName.includes('coin')) return 'Cryptominer';
        if (lowerName.includes('packed') || lowerName.includes('packer')) return 'Packed Malware';
        if (lowerName.includes('gen') || lowerName.includes('generic')) return 'Generic Malware';
        if (lowerName.includes('heur') || lowerName.includes('heuristic')) return 'Heuristic Detection';
        
        return 'Malicious Software';
    }
    
    /**
     * Extract malware family name from detection name
     */
    private extractMalwareFamily(detectionName: string): string | null {
        // Common patterns in AV detections
        const patterns = [
            /\b(win32|win64|msil|html|js|vbs|bat|ps1)\.(.+?)\./i,
            /\b(trojan|worm|backdoor|ransomware|spyware|adware|rootkit)\.(\w+)/i,
            /\.(\w+)\.(gen|generic|heur|a|b|c|d|e|f|g|h|i)/i
        ];
        
        for (const pattern of patterns) {
            const match = detectionName.match(pattern);
            if (match && match[2]) {
                return match[2].charAt(0).toUpperCase() + match[2].slice(1);
            }
        }
        
        // If no pattern matches, try to extract the most specific part
        const parts = detectionName.split(/[\.\/\-_:\s]/);
        if (parts.length > 1) {
            // Skip common AV prefixes
            const skipPrefixes = ['trojan', 'virus', 'malware', 'generic', 'win32', 'win64'];
            for (const part of parts) {
                if (part.length > 3 && !skipPrefixes.includes(part.toLowerCase())) {
                    return part.charAt(0).toUpperCase() + part.slice(1);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Map a database record to a FileScanResult object
     */
    private mapDbRecordToResult(record: any): FileScanResult {
        // Extract signatures from results if available
        let signatures = undefined;
        if (record.results && record.results.signatures) {
            signatures = record.results.signatures;
        } else if (record.results && record.stats && record.stats.malicious > 0) {
            // If there are malicious detections but no signatures, try to extract them
            signatures = this.extractThreatSignatures(record.results);
        }
        
        return {
            id: record.id,
            fileName: record.file_name,
            fileSize: record.file_size,
            fileType: record.file_type,
            hash: {
                md5: record.md5_hash,
                sha1: record.sha1_hash,
                sha256: record.sha256_hash
            },
            scanId: record.scan_id,
            scanDate: record.scan_date,
            permalink: record.permalink,
            status: record.status,
            stats: record.stats,
            results: record.results,
            signatures: signatures
        };
    }

    /**
     * Start background polling for scan results
     * @param scanId The scan ID to poll for
     */
    private startBackgroundPolling(scanId: string): void {
        console.log(`Starting background polling for scan ${scanId}`);
        
        // Initial delay before first check (2 seconds - reduced from 5)
        const initialDelay = 2000;
        
        // Maximum number of retries
        const maxRetries = 15; // Reduced from 24 to be more efficient
        
        // Start polling with true exponential backoff
        this.pollWithBackoff(scanId, 0, initialDelay, maxRetries);
        
        // Also initiate a parallel check with VirusTotal's API
        this.checkVirusTotalDirectly(scanId);
    }
    
    /**
     * Check VirusTotal API directly for faster results
     * This is a parallel approach to complement the regular polling
     */
    private async checkVirusTotalDirectly(scanId: string): Promise<void> {
        try {
            console.log(`Initiating direct VirusTotal check for scan ${scanId}`);
            
            // Make a direct request to VirusTotal for the file report
            const currentRecord = await this.getReportByScanId(scanId);
            if (!currentRecord || !currentRecord.hash || !currentRecord.hash.sha256) {
                console.log(`Cannot perform direct check for scan ${scanId}: missing hash`);
                return;
            }
            
            // Try to get the file report by hash (this might return results faster)
            const fileReport = await this.vtApi.getFileReportByHash(currentRecord.hash.sha256);
            if (fileReport && fileReport.data && fileReport.data.attributes) {
                console.log(`Received direct file report for scan ${scanId}`);
                
                // Update the record with these results
                const updatedResult = await this.updateScanResults(scanId, fileReport);
                
                // Emit WebSocket event with the updated results
                if (updatedResult) {
                    console.log(`Emitting WebSocket update from direct check for scan ${scanId}`);
                    emitScanUpdate(io, scanId, {
                        status: updatedResult.status,
                        results: updatedResult
                    });
                }
            } else {
                console.log(`No direct results available yet for scan ${scanId}`);
            }
        } catch (error) {
            console.error(`Error in direct VirusTotal check for scan ${scanId}:`, error);
        }
    }
    
    /**
     * Poll for scan results with exponential backoff
     * @param scanId The scan ID to poll for
     * @param attempt Current attempt number
     * @param delay Delay in milliseconds before next attempt
     * @param maxRetries Maximum number of retry attempts
     */
    private pollWithBackoff(scanId: string, attempt: number, delay: number, maxRetries: number): void {
        console.log(`Scheduling poll for scan ${scanId}, attempt ${attempt}, delay ${delay}ms`);
        
        // Schedule the next poll after the delay
        setTimeout(async () => {
            try {
                console.log(`Executing poll for scan ${scanId}, attempt ${attempt}`);
                
                // Get current record
                const currentRecord = await this.getReportByScanId(scanId);
                
                // If record doesn't exist or is already completed, stop polling
                if (!currentRecord) {
                    console.log(`Record not found for scan ${scanId}, stopping polling`);
                    return;
                }
                
                if (currentRecord.status === 'completed') {
                    console.log(`Scan ${scanId} already completed, stopping polling`);
                    return;
                }
                
                console.log(`Fetching analysis results for scan ${scanId} from VirusTotal`);
                
                // Get analysis results from VirusTotal
                const analysisResults = await this.vtApi.getFileAnalysisResults(scanId);
                console.log(`Received analysis results for scan ${scanId}:`, analysisResults ? 'Results received' : 'No results');
                
                // Update the record with the latest results
                const updatedResult = await this.updateScanResults(scanId, analysisResults);
                console.log(`Updated database record for scan ${scanId}:`, updatedResult ? 'Record updated' : 'No update');
                
                // Emit WebSocket event with the updated results
                if (updatedResult) {
                    console.log(`Emitting WebSocket update for scan ${scanId}`);
                    emitScanUpdate(io, scanId, {
                        status: updatedResult.status,
                        results: updatedResult
                    });
                    
                    // If scan is completed, stop polling
                    if (updatedResult.status === 'completed') {
                        console.log(`Scan ${scanId} completed, stopping polling`);
                        return;
                    }
                }
                
                // If we haven't reached max retries, schedule next poll with increased delay
                if (attempt < maxRetries) {
                    // Use true exponential backoff - multiply delay by 1.5 each time
                    // This gives more aggressive polling at the start and more space between polls later
                    const nextDelay = Math.min(delay * 1.5, 30000); // Cap at 30 seconds
                    console.log(`Scheduling next poll for scan ${scanId}, attempt ${attempt + 1}, delay ${nextDelay}ms`);
                    this.pollWithBackoff(scanId, attempt + 1, nextDelay, maxRetries);
                } else {
                    console.log(`Max polling attempts (${maxRetries}) reached for scan ${scanId}`);
                    
                    // Even after max retries, continue with occasional checks
                    this.continueLongRunningCheck(scanId);
                }
            } catch (error) {
                console.error(`Error polling for scan ${scanId}:`, error);
                
                // If there was an error, still try again with the next scheduled poll
                // but don't increase the backoff as aggressively
                if (attempt < maxRetries) {
                    const nextDelay = delay * 1.2; // Slower backoff after errors
                    console.log(`Rescheduling poll after error for scan ${scanId}, attempt ${attempt + 1}, delay ${nextDelay}ms`);
                    this.pollWithBackoff(scanId, attempt + 1, nextDelay, maxRetries);
                }
            }
        }, delay);
    }
    
    /**
     * Continue checking long-running scans at a reduced frequency
     */
    private continueLongRunningCheck(scanId: string): void {
        console.log(`Starting long-running check for scan ${scanId}`);
        
        // Check every 60 seconds for long-running scans
        const longRunningInterval = 60000;
        
        setTimeout(async () => {
            try {
                // Get current record
                const currentRecord = await this.getReportByScanId(scanId);
                
                // If record doesn't exist or is already completed, stop checking
                if (!currentRecord) {
                    console.log(`Record not found for long-running scan ${scanId}, stopping checks`);
                    return;
                }
                
                if (currentRecord.status === 'completed') {
                    console.log(`Long-running scan ${scanId} completed, stopping checks`);
                    return;
                }
                
                console.log(`Performing long-running check for scan ${scanId}`);
                
                // Try both the analysis endpoint and the file report endpoint
                const [analysisResults, fileReport] = await Promise.allSettled([
                    this.vtApi.getFileAnalysisResults(scanId),
                    this.vtApi.getFileReportByHash(currentRecord.hash.sha256)
                ]);
                
                let results = null;
                if (analysisResults.status === 'fulfilled' && analysisResults.value) {
                    results = analysisResults.value;
                } else if (fileReport.status === 'fulfilled' && fileReport.value) {
                    results = fileReport.value;
                }
                
                if (results) {
                    // Update the record with the latest results
                    const updatedResult = await this.updateScanResults(scanId, results);
                    
                    // Emit WebSocket event with the updated results
                    if (updatedResult) {
                        console.log(`Emitting WebSocket update for long-running scan ${scanId}`);
                        emitScanUpdate(io, scanId, {
                            status: updatedResult.status,
                            results: updatedResult
                        });
                        
                        // If scan is completed, stop checking
                        if (updatedResult.status === 'completed') {
                            console.log(`Long-running scan ${scanId} completed, stopping checks`);
                            return;
                        }
                    }
                }
                
                // Schedule the next long-running check
                this.continueLongRunningCheck(scanId);
            } catch (error) {
                console.error(`Error in long-running check for scan ${scanId}:`, error);
                
                // Even if there's an error, continue checking
                this.continueLongRunningCheck(scanId);
            }
        }, longRunningInterval);
    }
}
