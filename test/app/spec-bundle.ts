// tslint:disable-next-line
/// <reference path="../utils/matchers/index.d.ts"/>

// tslint:disable:no-var-requires
// require("zone.js/dist/zone");
require("zone.js/dist/long-stack-trace-zone");
require("zone.js/dist/async-test");
require("zone.js/dist/fake-async-test");
require("zone.js/dist/sync-test");
require("zone.js/dist/proxy");
require("zone.js/dist/jasmine-patch");
Error.stackTraceLimit = 5;
import "hammerjs";
import "../utils/matchers";
