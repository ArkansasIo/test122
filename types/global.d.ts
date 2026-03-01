/**
 * Global type definitions
 */

/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      DEBUG?: string;
    }
  }
}

export {};
