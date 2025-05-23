import { Server } from 'miragejs';

declare global {
  interface Window {
    server?: Server;
  }
}

export {};