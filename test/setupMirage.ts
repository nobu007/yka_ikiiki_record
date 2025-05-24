import { makeServer } from '@/mirage/server';

let server: ReturnType<typeof makeServer>;

const createTestServer = ({ environment = 'test' } = {}) => {
  server = makeServer({ environment });
  return server;
};

// Jest setup用のグローバル設定
beforeEach(() => {
  createTestServer();
});

// テスト終了時にサーバーをシャットダウン
afterEach(() => {
  if (window.server) {
    window.server.shutdown();
  }
});

export { createTestServer };