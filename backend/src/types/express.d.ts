import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username?: string;
        email?: string;
      };
    }
  }
}

// This file is necessary for TypeScript to recognize the extended Express Request type
export {};
