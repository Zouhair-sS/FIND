import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'alya-placement': any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'alya-placement': any;
    }
  }
}

export {};
