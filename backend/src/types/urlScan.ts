export interface CommentVotes {
  positive: number;
  negative: number;
  abuse: number;
}

export interface CommentAttributes {
  date: number;
  text: string;
  html: string;
  votes: CommentVotes;
  tags: string[];
}

export interface CommunityComment {
  attributes: CommentAttributes;
  type: string;
  id: string;
  links: {
    self: string;
  };
}

export interface VoteAttributes {
  date: number;
  verdict: string;
  value: number;
}

export interface CommunityVote {
  attributes: VoteAttributes;
  type: string;
  id: string;
  links: {
    self: string;
  };
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

export interface APIResponse<T> {
  data: T[];
  meta: {
    cursor?: string;
    count?: number;
  };
  links: {
    self: string;
    next?: string;
  };
}

export interface VTAPIResponse<T> {
  data: {
    data: T[];
    meta: {
      count?: number;
      cursor?: string;
    };
    links: {
      self: string;
      next?: string;
    };
  };
}

export interface URLScanResult {
  status: string;
  data: {
    scanId: string;
    url: string;
    domain: string;
    stats: {
      harmless: number;
      malicious: number;
      suspicious: number;
      undetected: number;
      timeout: number;
    };
    lastAnalysisResults: {
      engine: string;
      category: string;
      result: string;
      method: string;
    }[];
    communityFeedback: CommunityFeedback;
    scanDate: string;
    firstSubmissionDate: string;
    lastSubmissionDate: string;
    httpResponse: {
      finalUrl: string;
      ipAddress: string;
      statusCode: number;
      bodyLength: number;
      bodySha256: string;
      headers: {
        [key: string]: string;
      };
      redirectionChain: string[];
    };
  };
}

export interface URLScanRecord {
  id: number;
  url: string;
  scanId: string;
  results: URLScanResult;
  createdAt: string;
}
