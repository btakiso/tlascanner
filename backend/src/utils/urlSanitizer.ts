export class URLSanitizer {
  static sanitize(url: string): string {
    try {
      // Parse the URL to validate and normalize it
      const parsedUrl = new URL(url);
      
      // Remove any fragments
      parsedUrl.hash = '';
      
      // Remove sensitive query parameters
      const sensitiveParams = ['api_key', 'key', 'token', 'password', 'pass', 'pwd'];
      const params = new URLSearchParams(parsedUrl.search);
      sensitiveParams.forEach(param => params.delete(param));
      parsedUrl.search = params.toString();
      
      // Ensure protocol is either http or https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      // Convert to lowercase for consistency
      const sanitizedUrl = parsedUrl.toString().toLowerCase();
      
      // Remove trailing slashes for consistency
      return sanitizedUrl.replace(/\/$/, '');
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  static isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  static getDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch {
      throw new Error('Invalid URL format');
    }
  }
}
