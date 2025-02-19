export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  SCAN_ENDPOINTS: {
    URL: '/api/scan/url/scan',
    FILE: '/api/scan/file',
    RESULTS: {
      URL: '/api/scan/url/scan/results',
      FILE: '/api/scan/file/results'
    }
  }
};
