// Conditional imports to help webpack detect the shared modules
if (Math.random() < 0) {
  require('./version-include.js');
  require('./version-exclude.js');
  require('./version-include-fail.js');
  require('./version-exclude-fail.js');
  require('./singleton-filter.js');
}

let warnings = [];
let oldWarn;

beforeEach((done) => {
  oldWarn = console.warn;
  console.warn = (m) => warnings.push(m);
  done();
});

afterEach((done) => {
  expectWarning();
  console.warn = oldWarn;
  done();
});

const expectWarning = (regexp) => {
  if (!regexp) {
    expect(warnings).toEqual([]);
  } else if (Array.isArray(regexp)) {
    expect(warnings.length).toBe(regexp.length);
    regexp.forEach((r, i) => {
      expect(r.test(warnings[i])).toEqual(true);
    });
  } else {
    warnings.forEach((warning) => {
      expect(regexp.test(warning)).toEqual(true);
    });
  }
  warnings.length = 0;
};

it('should provide modules that pass version include filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing
  const module = await import('./version-include.js');
  expect(module.default).toBe('version-include');

  // Check that the module was provided to the share scope
  expect(__webpack_require__.S).toBeDefined();
  expect(__webpack_require__.S['default']).toBeDefined();
  expect(__webpack_require__.S['default']['version-include']).toBeDefined();
  expect(
    __webpack_require__.S['default']['version-include']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should provide modules that pass version exclude filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing
  const module = await import('./version-exclude.js');
  expect(module.default).toBe('version-exclude');

  // Check that the module was provided to the share scope
  expect(__webpack_require__.S['default']['version-exclude']).toBeDefined();
  expect(
    __webpack_require__.S['default']['version-exclude']['1.2.0'],
  ).toBeDefined();
  expectWarning();
});

it('should not provide modules that fail version include filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./version-include-fail.js');
  expect(module.default).toBe('version-include-fail');

  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_require__.S['default']['version-include-fail'],
  ).toBeUndefined();
  expectWarning(/does not satisfy include filter/);
});

it('should not provide modules that fail version exclude filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./version-exclude-fail.js');
  expect(module.default).toBe('version-exclude-fail');

  // Check that the module was NOT provided to the share scope
  expect(
    __webpack_require__.S['default']['version-exclude-fail'],
  ).toBeUndefined();
  expectWarning(/matches exclude filter/);
});

it('should warn about singleton filters', async () => {
  // Initialize the share scope first
  await __webpack_init_sharing__('default');

  // Import the module to trigger sharing processing
  const module = await import('./singleton-filter.js');
  expect(module.default).toBe('singleton-filter');

  // Check that the singleton module was provided
  expect(__webpack_require__.S['default']['singleton-filter']).toBeDefined();
  expect(
    __webpack_require__.S['default']['singleton-filter']['1.0.0'],
  ).toBeDefined();
  expectWarning(/singleton.*include.*version/);
});
