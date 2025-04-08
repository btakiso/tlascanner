import { BaseScanResponse, BaseScanStats, EngineResult } from './common';

export interface FileScanStats extends BaseScanStats {
  total: number;
}

export interface AnalysisResult {
  engine: string;
  category: string;
  result: string;
  method: string;
  engineVersion: string;
  engineUpdate: string;
  signatureName?: string;
}

export interface ThreatSignature {
  type: string;
  description: string;
  severity: string;
  name?: string;
  family?: string;
}

export interface FileScanResponse extends BaseScanResponse {
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  hash: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  scanDate: string;
  permalink?: string;
  stats: {
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout?: number;
  };
  results?: {
    [engine: string]: {
      category: string;
      result: string;
      method: string;
      engine_version: string;
      engine_update: string;
    };
  };
  signatures?: ThreatSignature[];
  reputation?: number;
}
