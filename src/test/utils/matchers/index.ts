import * as immutableMatchers from "./immutable-matchers";
import * as miscMatchers from "./misc-matchers";
import { toHaveNoViolations } from "jasmine-axe";

beforeEach(() => {
    jasmine.addMatchers(immutableMatchers.matchers);
    jasmine.addMatchers(miscMatchers.matchers);
    jasmine.addMatchers(toHaveNoViolations);
});
