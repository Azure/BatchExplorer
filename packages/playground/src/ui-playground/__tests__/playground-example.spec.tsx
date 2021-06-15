import { initMockEnvironment } from "@batch/ui-common";
import { render } from "@testing-library/react";
import * as React from "react";
import { PlaygroundExample } from "../playground-example";

/**
 * Test the example component to make sure the testing framework is working
 * properly. This file can also be used as a starting point for future
 * component tests.
 */
describe("Playground tests", () => {
    beforeEach(() => initMockEnvironment());

    test("Render the playground", () => {
        render(<PlaygroundExample />);
    });
});
