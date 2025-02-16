/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  errorOnDeprecated: true,

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  preset: 'ts-jest',
};

export default config;
