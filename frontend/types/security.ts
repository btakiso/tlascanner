export type ScanType = 'URL' | 'FILE' | 'CVE';
export type ScanStatus = 'clean' | 'malicious' | 'warning';
export type DataSource = 'VirusTotal' | 'NVD' | 'MalwareBazaar';

export interface ScanEvent {
  id: string;
  type: ScanType;
  source: DataSource;
  status: ScanStatus;
  timestamp: string;
  details: string;
}

export interface AggregatedMetrics {
  totalUrlsScanned: number;
  totalFilesAnalyzed: number;
  maliciousDetections: number;
  criticalCVEs: number;
}

export interface APIResponse {
  virusTotal: {
    urlScans: number;
    fileScans: number;
    malwareDetections: number;
    recentScans: ScanEvent[];
    detectionRates: { date: string; detections: number }[];
  };
  nvd: {
    totalCVEs: number;
    criticalCVEs: number;
    recentCVEs: ScanEvent[];
    severityDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  malwareBazaar: {
    totalFiles: number;
    maliciousFiles: number;
    recentFiles: ScanEvent[];
    signatureMatches: { signature: string; count: number }[];
  };
}
