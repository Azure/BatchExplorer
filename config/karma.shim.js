require("../test/app/spec-bundle");
const moment = require("moment");
// tslint:disable:no-var-requires
// tslint:disable:no-console

Error.stackTraceLimit = Infinity;
require("app/utils/extensions");
const fs = require("fs");

const testing = require("@angular/core/testing");
const browser = require("@angular/platform-browser-dynamic/testing");

testing.TestBed.initTestEnvironment(
    browser.BrowserDynamicTestingModule,
    browser.platformBrowserDynamicTesting()
);

const webpackRequire = require;
const chromePerformance = performance;

/*
 * Ok, this is kinda crazy. We can use the context method on
 * require that webpack created in order to tell webpack
 * what files we actually want to require or import.
 * Below, context will be a function/object with file names as keys.
 * Using that regex we are saying look in ../src then find
 * any file that ends with spec.ts and get its path. By passing in true
 * we say do this recursively
 */
const testContext = require.context("../test/app", true, /\.spec\.ts/);
const testAppContext = require.context("../app", true, /\.spec\.ts/);
const testCommonContext = require.context("../src/common", true, /\.spec\.ts/);

if (process.env.DEBUG_MEM) {
    let initialValue = null;
    const stream = fs.createWriteStream("test.mem.csv");
    jasmine.getEnv().clearReporters();
    jasmine.getEnv().addReporter({
        suiteStarted: (result) => {
            if (initialValue === null) {
                initialValue = chromePerformance.memory.usedJSHeapSize;
            }
        },
        suiteDone: (result) => {
            const end = chromePerformance.memory.usedJSHeapSize;
            const out = Math.round(end / 1000);

            console.warn("Memory usage", `${out} kB`, result.fullName);
            stream.write(`${result.fullName},${out}\n`);
        },
        jasmineDone: () => {
            stream.end();
        }
    });
}

/**
 * TODO: override the default jasmine reporter to show results with timings like:
 * ActivatePackageDialogComponent
 *   √ Should show title and application id (865ms)
 *   √ Submit should call service and close the dialog (194ms)
 *   √ Submit should call service and show error if fails (929ms)
 */
if (process.env.DEBUG_TIME) {
    let timer = null;
    jasmine.getEnv().clearReporters();
    jasmine.getEnv().addReporter({
        specStarted: (result) => {
            timer = moment.utc();
        },
        specDone: (result) => {
            let ms = moment.duration(moment.utc().diff(timer)).milliseconds();
            if (result.status !== "disabled") {
                console.warn(`${result.description}, executed in: ${ms}ms`);
            }
        },
    });
}

/*
 * get all the files, for each file, call the context function
 * that will require the file and load it up here. Context will
 * loop and require those spec files here
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

// requires and returns all modules that match
const modules = [...requireAll(testContext), ...requireAll(testAppContext), ...requireAll(testCommonContext)];
console.warn(`Running specs from ${modules.length} files`);
