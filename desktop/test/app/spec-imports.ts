// eslint-disable-next-line
/// <reference path="../../src/test/utils/matchers/index.d.ts"/>
jasmine.MAX_PRETTY_PRINT_DEPTH = 3;

import "reflect-metadata";

/* eslint-disable @typescript-eslint/no-var-requires */
require("zone.js");
require("zone.js/testing");

import "@batch-flask/extensions";
import "hammerjs";
import "test/utils/matchers";

import "app/styles/main.scss";
