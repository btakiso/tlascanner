export interface URLScanResult {
  status: 'success' | 'error';
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
      [key: string]: {
        category: string;
        result: string;
        method: string;
        engine_name: string;
      };
    };
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
