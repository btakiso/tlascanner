import { BaseScanStats } from './common';

export interface EngineResult {
  category: string;
  result: string;
  method: string;
  engine_name: string;
}

export interface CommentVotes {
  positive: number;
  negative: number;
  abuse: number;
}

export interface CommunityComment {
  id: string;
  text: string;
  date: number;
  tags: string[];
  votes: CommentVotes;
}

export interface CommunityVote {
  id: string;
  date: number;
  verdict: string;
  value: number;
}

export interface VoteTotals {
  harmless: number;
  malicious: number;
}

export interface CommunityFeedback {
  comments: CommunityComment[];
  votes: CommunityVote[];
  totalVotes: VoteTotals;
  totalComments: number;
  totalVotesCount: number;
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
