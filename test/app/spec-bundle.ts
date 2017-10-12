// tslint:disable-next-line
/// <reference path="../utils/matchers/index.d.ts"/>
jasmine.MAX_PRETTY_PRINT_DEPTH = 2;

import "reflect-metadata";

import "core-js/es6";
// tslint:disable:no-var-requires
require("zone.js");
require("zone.js/dist/long-stack-trace-zone");
require("zone.js/dist/async-test");
require("zone.js/dist/fake-async-test");
require("zone.js/dist/sync-test");
require("zone.js/dist/proxy");
require("zone.js/dist/jasmine-patch");
Error.stackTraceLimit = 5;

import "hammerjs";
import "moment-duration-format";
import "../utils/matchers";

import "../../app/styles/main.scss";
