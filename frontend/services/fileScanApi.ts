import { API_BASE_URL } from '@/config';
import { FileScanResponse } from '@/types/fileScan';

/**
 * Helper function to implement retry logic with exponential backoff
 * @param fn The async function to retry
 * @param retries Maximum number of retries
 * @param delay Initial delay in milliseconds
 * @returns Promise with the result of the function
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if we have retries left
    if (retries <= 0) {
      console.error("Retry attempts exhausted:", error);
      throw error;
    }
    
    // Determine if we should retry based on error type
    const shouldRetry = 
      (error.message && error.message.includes('HTTP error 429')) || // Rate limit
      (error.message && error.message.includes('network')) ||        // Network issues
      (error.message && error.message.includes('timeout')) ||        // Timeouts
      (error.message && error.message.includes('500'));              // Server errors
    
    if (!shouldRetry) {
      console.error("Non-retryable error:", error);
      throw error;
    }
    
    console.log(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
    console.log(`Error details: ${error.message}`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff - double the delay for next retry with some randomness
    // to prevent all clients from retrying at the same time
    const jitter = Math.random() * 0.3 + 0.85; // Random factor between 0.85 and 1.15
    return retryWithBackoff(fn, retries - 1, Math.floor(delay * 2 * jitter));
  }
}

/**
 * Upload and scan a file
 * @param file The file to scan
 * @returns Promise with scan result
 */
export async function uploadAndScanFile(file: File): Promise<FileScanResponse> {
  console.log("API_BASE_URL:", API_BASE_URL);
  
  return retryWithBackoff(async () => {
    const formData = new FormData();
    formData.append('file', file);

    // Fix the URL to match the backend route configuration
    const response = await fetch(`${API_BASE_URL}/scan/file/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      console.error("Upload error response:", errorData);
      
      // Handle specific error cases
      if (response.status === 413) {
        throw new Error(`File size exceeds the 32MB limit.`);
      } else if (response.status === 429) {
        throw new Error(`HTTP error 429: Rate limit exceeded. Please try again later.`);
      } else if (response.status === 500) {
        throw new Error(`Server error. Please try again later or contact support.`);
      }
      
      throw new Error(errorData.error || `Failed to scan file: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  });
}

/**
 * Get file scan result by ID
 * @param id The scan ID
 * @returns Promise with scan result
 */
export async function getFileScanById(id: string): Promise<FileScanResponse> {
  return retryWithBackoff(async () => {
    const response = await fetch(`${API_BASE_URL}/scan/file/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(errorData.error || `Failed to get scan result: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  });
}

/**
 * Check the status of a file scan
 * @param scanId The scan ID
 * @returns Promise with scan result
 */
export async function checkFileScanStatus(scanId: string): Promise<FileScanResponse> {
  return retryWithBackoff(async () => {
    const response = await fetch(`${API_BASE_URL}/scan/file/${scanId}/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      
      // Handle specific error cases with more user-friendly messages
      if (response.status === 429) {
        throw new Error(`HTTP error 429: Rate limit exceeded. The system will automatically retry with increased delays.`);
      } else if (response.status === 404) {
        throw new Error(`Scan ID not found. The scan may have been deleted or expired.`);
      } else if (response.status === 500) {
        throw new Error(`Server error. The system will continue to retry. If this persists, please contact support.`);
      }
      
      throw new Error(errorData.error || `Failed to check scan status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  });
}

/**
 * Get file scan result by file hash
 * @param hash The file hash (MD5, SHA-1, or SHA-256)
 * @returns Promise with scan result
 */
export async function getFileScanByHash(hash: string): Promise<FileScanResponse> {
  return retryWithBackoff(async () => {
    const response = await fetch(`${API_BASE_URL}/scan/file/hash/${hash}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(errorData.error || `Failed to get scan result by hash: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  });
}
