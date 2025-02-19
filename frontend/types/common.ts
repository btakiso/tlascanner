// Common types shared across different scan types
export interface BaseScanStats {
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout?: number;
}

export type ThreatLevel = "low" | "medium" | "high";

export interface EngineResult {
    engine: string;
    category: string;
    result: string;
    method?: string;
}

export interface CommunityReport {
    user: string;
    avatar: string;
    comment: string;
    date: string;
    votes: number;
}

export interface CommunityFeedback {
    reports: CommunityReport[];
    totalReports: number;
    riskScore: number;
}

// Base interface for all scan responses
export interface BaseScanResponse {
    scanId: string;
    scanDate: string;
    stats: BaseScanStats;
    permalink?: string;
    categories?: string[];
    lastAnalysisResults?: {
        [engine: string]: EngineResult;
    };
    communityFeedback?: CommunityFeedback;
}
