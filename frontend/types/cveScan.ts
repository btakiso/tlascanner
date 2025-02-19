import { BaseScanResponse } from './common';

export interface CVEDetails {
    id: string;
    description: string;
    severity: string;
    cvssScore: number;
    publishedDate: string;
    lastModifiedDate: string;
    references: string[];
}

export interface CVEScanResponse extends BaseScanResponse {
    target: string;  // Could be package name, version, or specific component
    vulnerabilities: CVEDetails[];
    affectedVersions?: string[];
    recommendations?: string[];
}
