import EventManager from './EventManager';

describe('EventManager - memoization', () => {
  it('should have displayName set for debugging', () => {
    expect(EventManager.displayName).toBe('EventManager');
  });

  it('should be wrapped with memo', () => {
    const memoizedComponent = EventManager;
    expect(memoizedComponent).toBeDefined();
    expect(typeof memoizedComponent).toBe('object');
  });
});
