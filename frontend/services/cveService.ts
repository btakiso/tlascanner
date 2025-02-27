import { CVESearchParams, CVESearchResponse, CVEDetails } from '@/types/cveScan';
import { config } from '@/app/config';

/**
 * Search for CVEs based on provided parameters
 * @param params Search parameters including keyword, CVE ID, pagination
 * @returns Promise with CVE search results
 */
export async function searchCVEs(params: CVESearchParams): Promise<CVESearchResponse> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.cveId) queryParams.append('cveId', params.cveId);
    if (params.startIndex !== undefined) queryParams.append('startIndex', params.startIndex.toString());
    if (params.resultsPerPage !== undefined) queryParams.append('resultsPerPage', params.resultsPerPage.toString());

    const apiUrl = `${config.API_URL}${config.CVE_ENDPOINTS.SEARCH}`;
    console.log('Making API request to:', apiUrl);
    console.log('Request params:', params);

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to search CVEs';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If parsing JSON fails, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    return responseData.data || responseData;
  } catch (error) {
    console.error('Error searching CVEs:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific CVE by ID
 * @param cveId The CVE ID (e.g., CVE-2021-44228)
 * @returns Promise with detailed CVE information
 */
export async function getCVEById(cveId: string): Promise<CVEDetails> {
  try {
    const apiUrl = `${config.API_URL}${config.CVE_ENDPOINTS.DETAILS}/${cveId}`;
    console.log('Making API request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to retrieve CVE ${cveId}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If parsing JSON fails, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    return responseData.data || responseData;
  } catch (error) {
    console.error(`Error retrieving CVE ${cveId}:`, error);
    throw error;
  }
}

/**
 * Get the appropriate CSS color class based on CVSS score
 * @param score CVSS score (0-10)
 * @returns CSS class name for the color
 */
export function getCVSSColor(score: number): string {
  if (score >= 9.0) return 'bg-red-500';
  if (score >= 7.0) return 'bg-orange-500';
  if (score >= 4.0) return 'bg-yellow-500';
  if (score > 0.0) return 'bg-blue-500';
  return 'bg-gray-500';
}

/**
 * Get the severity text based on CVSS score
 * @param score CVSS score (0-10)
 * @returns Severity text (CRITICAL, HIGH, etc.)
 */
export function getCVSSSeverityText(score: number): string {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score > 0.0) return 'LOW';
  return 'NONE';
}

/**
 * Parse a CVSS vector string into its components
 * @param vectorString CVSS vector string (e.g., "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")
 * @returns Object with key-value pairs of vector components
 */
export function parseVectorString(vectorString: string): Record<string, string> {
  if (!vectorString) return {};
  
  const components: Record<string, string> = {};
  const parts = vectorString.split('/');
  
  // Map of component abbreviations to full names
  const componentNames: Record<string, string> = {
    'AV': 'Attack Vector',
    'AC': 'Attack Complexity',
    'PR': 'Privileges Required',
    'UI': 'User Interaction',
    'S': 'Scope',
    'C': 'Confidentiality',
    'I': 'Integrity',
    'A': 'Availability',
    'E': 'Exploit Maturity',
    'RL': 'Remediation Level',
    'RC': 'Report Confidence',
    'CR': 'Confidentiality Req.',
    'IR': 'Integrity Req.',
    'AR': 'Availability Req.',
    'MAV': 'Modified Attack Vector',
    'MAC': 'Modified Attack Complexity',
    'MPR': 'Modified Privileges Required',
    'MUI': 'Modified User Interaction',
    'MS': 'Modified Scope',
    'MC': 'Modified Confidentiality',
    'MI': 'Modified Integrity',
    'MA': 'Modified Availability'
  };
  
  // Map of component values to full descriptions
  const valueDescriptions: Record<string, Record<string, string>> = {
    'AV': { 'N': 'Network', 'A': 'Adjacent', 'L': 'Local', 'P': 'Physical' },
    'AC': { 'L': 'Low', 'H': 'High' },
    'PR': { 'N': 'None', 'L': 'Low', 'H': 'High' },
    'UI': { 'N': 'None', 'R': 'Required' },
    'S': { 'U': 'Unchanged', 'C': 'Changed' },
    'C': { 'N': 'None', 'L': 'Low', 'H': 'High' },
    'I': { 'N': 'None', 'L': 'Low', 'H': 'High' },
    'A': { 'N': 'None', 'L': 'Low', 'H': 'High' }
  };
  
  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      const fullName = componentNames[key] || key;
      const fullValue = valueDescriptions[key]?.[value] || value;
      components[fullName] = fullValue;
    }
  }
  
  return components;
}

/**
 * Get a human-readable description for a CVSS vector component
 * @param key Vector component key (e.g., AV, AC)
 * @param value Vector component value (e.g., N, L)
 * @returns Human-readable description
 */
export function getVectorDescription(key: string, value: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    AV: {
      N: 'Network - The vulnerability can be exploited remotely',
      A: 'Adjacent - The vulnerability requires the attacker to be on the same network',
      L: 'Local - The vulnerability requires local access',
      P: 'Physical - The vulnerability requires physical access'
    },
    AC: {
      L: 'Low - No specialized conditions needed',
      H: 'High - Specialized conditions required'
    },
    PR: {
      N: 'None - No privileges required',
      L: 'Low - Low level privileges required',
      H: 'High - High level privileges required'
    },
    UI: {
      N: 'None - No user interaction required',
      R: 'Required - User interaction required'
    },
    S: {
      U: 'Unchanged - Impact limited to the vulnerable component',
      C: 'Changed - Impact extends beyond the vulnerable component'
    },
    C: {
      N: 'None - No impact to confidentiality',
      L: 'Low - Limited confidentiality impact',
      H: 'High - Total confidentiality impact'
    },
    I: {
      N: 'None - No impact to integrity',
      L: 'Low - Limited integrity impact',
      H: 'High - Total integrity impact'
    },
    A: {
      N: 'None - No impact to availability',
      L: 'Low - Limited availability impact',
      H: 'High - Total availability impact'
    }
  };

  return descriptions[key]?.[value] || `${key}:${value}`;
}
