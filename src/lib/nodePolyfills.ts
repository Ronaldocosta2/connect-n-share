
// Polyfills for Node.js globals used by simple-peer
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
  // @ts-ignore
  window.process = { env: {} };
  // @ts-ignore
  window.Buffer = window.Buffer || require('buffer').Buffer;
}

export {};
