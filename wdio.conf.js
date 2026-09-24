require('dotenv').config();
const jiraLogger = require('./test/helpers/jiraDefectLogger');

const ENV = process.env.TEST_ENV || 'dev';

const envConfig = {
  dev: { baseUrl: process.env.DEV_BASE_URL },
  staging: { baseUrl: process.env.STAGING_BASE_URL },
  prod: { baseUrl: process.env.PROD_BASE_URL },
}[ENV];

const isHeadless = process.env.HEADLESS === 'true';

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.spec.js'],
  exclude: [],

  maxInstances: 5,

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          ...(isHeadless ? ['--headless=new'] : []),
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1440,900',
        ],
      },
      acceptInsecureCerts: true,
    },
  ],

  logLevel: 'error',
  bail: 0,
  baseUrl: envConfig.baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Industry-standard resilience: retry a flaky test once before failing it for real
  specFileRetries: 1,
  specFileRetriesDelay: 2,

  framework: 'mocha',

  reporters: [
    'spec',
    ['allure', {
      outputDir: './reports/allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
    }],
    ['junit', {
      outputDir: './reports/junit-results',
      outputFileFormat: (options) => `results-${options.cid}.xml`,
    }],
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // ---- Hooks ----

  before: function () {
    global.expect = require('chai').expect;
  },

  afterTest: async function (test, context, { error, passed }) {
    if (!passed) {
      let screenshotBase64;
      try {
        screenshotBase64 = await browser.takeScreenshot();
      } catch (e) {
        // ignore screenshot failures
      }

      await jiraLogger.logDefect({
        testTitle: test.title,
        specFile: test.file,
        errorMessage: error?.message || 'Unknown error',
        errorStack: error?.stack,
        screenshotBase64,
      });
    }
  },

  onComplete: function () {
    console.log(`\nTest run complete for environment: ${ENV}`);
    console.log('Generate the HTML report with: npm run report:generate && npm run report:open');
  },
};
