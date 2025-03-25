// Search parameters for CVE queries
export interface CVESearchParams {
    keyword?: string;
    cveId?: string;
    startIndex?: number;
    resultsPerPage?: number;
    // Additional fields for search history tracking
    ipAddress?: string;
    userAgent?: string;
}

// Response structure from NVD API
export interface CVESearchResponse {
    resultsPerPage: number;
    startIndex: number;
    totalResults: number;
    format: string;
    version: string;
    timestamp: string;
    vulnerabilities: CVEItem[];
}

// Main CVE item structure
export interface CVEItem {
    id: string;
    sourceIdentifier: string;
    published: string;
    lastModified: string;
    vulnStatus: string;
    descriptions: CVEDescription[];
    metrics: CVEMetrics;
    references: CVEReference[];
    weaknesses: CVEWeakness[];
}

// Description with language support
export interface CVEDescription {
    lang: string;
    value: string;
}

// Metrics including CVSS scores
export interface CVEMetrics {
    cvssMetrics: CVSSMetric[];
    cvssMetricV31?: CVSSMetric[];
    cvssMetricV2?: CVSSMetric[];
}

// CVSS scoring metric
export interface CVSSMetric {
    source: string;
    type: string;
    cvssData: {
        version: string;
        vectorString: string;
        baseScore: number;
        baseSeverity: string;
        attackVector?: string;
        attackComplexity?: string;
        privilegesRequired?: string;
        userInteraction?: string;
        scope?: string;
        confidentialityImpact?: string;
        integrityImpact?: string;
        availabilityImpact?: string;
    };
    exploitabilityScore?: number;
    impactScore?: number;
}

// Reference links and sources
export interface CVEReference {
    url: string;
    source: string;
    tags: string[];
}

// Weakness information (CWE)
export interface CVEWeakness {
    source: string;
    type: string;
    description: CVEDescription[];
}

// Cache entry structure for database
export interface CVECacheEntry {
    id: string;
    cveId?: string;
    searchKeyword?: string;
    cveData?: CVEItem;
    responseData?: CVESearchResponse;
    cachedAt: Date;
    createdAt: Date;
}

// Severity levels for CVSS scores
export enum CVESeverity {
    NONE = 'NONE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

// Helper type for CVSS vector components
export interface CVSSVectorComponents {
    attackVector: string;
    attackComplexity: string;
    privilegesRequired: string;
    userInteraction: string;
    scope: string;
    confidentialityImpact: string;
    integrityImpact: string;
    availabilityImpact: string;
}
