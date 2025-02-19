import { BaseScanStats } from './common';

export interface EngineResult {
  category: string;
  result: string;
  method: string;
  engine_name: string;
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

export interface HTTPResponse {
  finalUrl: string;
  ipAddress: string;
  statusCode: number;
  bodyLength: number;
  bodySha256: string;
  headers: Record<string, string>;
  redirectionChain: string[];
}

export interface URLScanResponse {
  status: string;
  data: {
    scanId: string;
    url: string;
    domain: string;
    scanDate: string;
    firstSubmissionDate: string;
    lastSubmissionDate: string;
    stats: BaseScanStats;
    lastAnalysisResults: Record<string, EngineResult>;
    categories: string[];
    httpResponse: HTTPResponse;
    reputation: number;
    communityFeedback: CommunityFeedback;
  };
}
