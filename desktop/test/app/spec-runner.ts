/* eslint-disable no-console */
import "./spec-imports";

import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import "./spec-reporters";

TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
);

declare global {
    interface NodeRequire {
        context: any;
    }
}

/*
 * Ok, this is kinda crazy. We can use the context method on
 * require that webpack created in order to tell webpack
 * what files we actually want to require or import.
 * Below, context will be a function/object with file names as keys.
 * Using that regex we are saying look in ../src then find
 * any file that ends with spec.ts and get its path. By passing in true
 * we say do this recursivelyf
 */
const testContext = require.context(".", true, /\.spec\.ts/);
const testAppContext = require.context("../../src/app", true, /\.spec\.ts/);
const testCommonContext = require.context("../../src/common", true, /\.spec\.ts/);
// Exclude the @batch-flask/compiler folder
const testBlCommonContext = require.context("../../src/@batch-flask", true,
    /^\.\/(?!compiler)(?!.*node\.spec\.ts).*\.spec\.ts$/);

/*
 * get all the files, for each file, call the context function
 * that will require the file and load it up here. Context will
 * loop and require those spec files here
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

// requires and returns all modules that match
const modules = [
    ...requireAll(testContext),
    ...requireAll(testAppContext),
    ...requireAll(testCommonContext),
    ...requireAll(testBlCommonContext),
];
console.log(`Running specs from ${modules.length} files`);

import "./spec-controls";
