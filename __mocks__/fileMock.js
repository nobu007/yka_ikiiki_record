/**
 * Mock for static asset files (images, SVGs, etc.)
 *
 * Returns a test stub string to prevent import errors in tests.
 * Jest configuration maps all .png, .jpg, .jpeg, .gif, .svg, .ico, .webp imports to this file.
 *
 * @see jest.config.js moduleNameMapper for asset patterns
 */
module.exports = 'test-file-stub';
