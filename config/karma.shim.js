Error.stackTraceLimit = Infinity;
import "app/utils/extensions";
import * as fs from "fs";

const testing = require("@angular/core/testing");
const browser = require("@angular/platform-browser-dynamic/testing");

testing.TestBed.initTestEnvironment(
    browser.BrowserDynamicTestingModule,
    browser.platformBrowserDynamicTesting()
);

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

if (process.env.DEBUG_MEM) {
    let initialValue = null;
    jasmine.getEnv().clearReporters();
    const stream = fs.createWriteStream("test.mem.csv");
    jasmine.getEnv().addReporter({
        suiteStarted: (result) => {
            if (initialValue === null) {
                initialValue = performance.memory.usedJSHeapSize;
            }
        },
        suiteDone: (result) => {
            const end = performance.memory.usedJSHeapSize;
            const out = Math.round((end - initialValue) / 1000);
            console.warn("Memory increase", `${out} kB`, result.fullName);
            stream.write(`${result.fullName},${out}\n`);
        },
        jasmineDone: () => {
            stream.end();
        }
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
let initialValue = null;
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter({
    suiteStarted: (result) => {
        if (initialValue === null) {
            initialValue = performance.memory.usedJSHeapSize;
        }
    },
    suiteDone: (result) => {
        const end = performance.memory.usedJSHeapSize;
        const out = Math.round((end - initialValue) / 1000);
        console.warn("Memory increase", `${out} kB`, result.fullName);
    }
});

// requires and returns all modules that match
var modules = requireAll(testContext);
