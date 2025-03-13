import { BaseScanResponse } from './common';

export interface CVEDescription {
    lang: string;
    value: string;
}

export interface CVSSData {
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
}

export interface CVSSMetric {
    source: string;
    type: string;
    cvssData: CVSSData;
    exploitabilityScore?: number;
    impactScore?: number;
    baseSeverity?: string;
}

export interface CVEReference {
    url: string;
    source: string;
    tags: string[];
}

export interface CVEWeakness {
    source: string;
    type: string;
    description: CVEDescription[];
}

export interface CVEDetails {
    id: string;
    sourceIdentifier?: string;
    published: string;
    lastModified: string;
    vulnStatus?: string;
    descriptions: CVEDescription[];
    metrics: {
        cvssMetrics?: CVSSMetric[];
        cvssMetricV31?: CVSSMetric[];
        cvssMetricV2?: CVSSMetric[];
    };
    references: CVEReference[];
    weaknesses: CVEWeakness[];
    cve?: any; // For nested CVE data structure
}

export interface CVESearchParams {
    keyword?: string;
    cveId?: string;
    startIndex?: number;
    resultsPerPage?: number;
}

export interface CVESearchResponse {
    resultsPerPage: number;
    startIndex: number;
    totalResults: number;
    format: string;
    version: string;
    timestamp: string;
    vulnerabilities: CVEDetails[];
}

export interface CVEScanResponse extends BaseScanResponse {
    target: string;  // Could be package name, version, or specific component
    vulnerabilities: CVEDetails[];
    affectedVersions?: string[];
    recommendations?: string[];
}

export enum CVESeverity {
    NONE = 'NONE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}
