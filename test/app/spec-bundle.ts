// tslint:disable-next-line
/// <reference path="../utils/matchers/index.d.ts"/>
jasmine.MAX_PRETTY_PRINT_DEPTH = 2;

import "reflect-metadata";

import "core-js/es6";
// tslint:disable:no-var-requires
require("zone.js/dist/zone");
require("zone.js/dist/long-stack-trace-zone");
require("zone.js/dist/proxy"); // since zone.js 0.6.15
require("zone.js/dist/sync-test");
require("zone.js/dist/jasmine-patch"); // put here since zone.js 0.6.14
require("zone.js/dist/async-test");
require("zone.js/dist/fake-async-test");
Error.stackTraceLimit = 5;

import "hammerjs";
import "moment-duration-format";
import "../utils/matchers";

import "../../app/styles/main.scss";
