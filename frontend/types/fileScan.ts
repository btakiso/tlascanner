import { BaseScanResponse } from './common';

export interface FileScanResponse extends BaseScanResponse {
    fileName: string;
    fileSize: number;
    fileType: string;
    hash: {
        md5: string;
        sha1: string;
        sha256: string;
    };
    // Add file-specific fields here
    signatures?: {
        matched: string[];
        total: number;
    };
}
