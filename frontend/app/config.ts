export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  SCAN_ENDPOINTS: {
    URL: '/scan/url/scan',
    FILE: '/scan/file',
    RESULTS: {
      URL: '/scan/url/scan/results',
      FILE: '/scan/file/results'
    }
  },
  CVE_ENDPOINTS: {
    SEARCH: '/cve/search',
    DETAILS: '/cve'
  }
};
