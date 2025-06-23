/**
 * Jest Polyfills
 * 
 * This file adds polyfills for browser APIs that are not available in Node.js
 * but are required by our testing environment (particularly for MSW).
 */

const { TextDecoder, TextEncoder } = require('util')

// Polyfill for fetch and related APIs
const { fetch, Headers, Request, Response } = require('undici')

// Make fetch and related APIs available globally
Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true },
    Headers: { value: Headers, writable: true },
    Request: { value: Request, writable: true },
    Response: { value: Response, writable: true },
})

// TextEncoder/TextDecoder polyfills
Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder, writable: true },
    TextEncoder: { value: TextEncoder, writable: true },
})
