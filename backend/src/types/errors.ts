export class ScanError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ScanError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}
