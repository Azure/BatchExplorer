import * as immutableMatchers from "./immutable-matchers";
import * as miscMatchers from "./misc-matchers";

beforeEach(() => {
    jasmine.addMatchers(immutableMatchers.matchers);
    jasmine.addMatchers(miscMatchers.matchers);
});
