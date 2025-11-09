// Simplified API route test focusing on core functionality
describe('/api/seed route', () => {
  // Basic test to ensure the route exists and can be imported
  it('should be able to import the POST handler', async () => {
    const { POST } = await import('./route');
    expect(typeof POST).toBe('function');
  });

  // Test that the route exists and is defined
  it('should have POST handler defined', async () => {
    const routeModule = await import('./route');
    expect(routeModule.POST).toBeDefined();
  });
});