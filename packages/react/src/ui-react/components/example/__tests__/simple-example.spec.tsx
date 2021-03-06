import { getEnvironment } from "@batch/ui-common";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../..";
import { runAxe } from "../../../test-util/a11y";
import { SimpleExample } from "../simple-example";

/**
 * Test the example component to make sure the testing framework is working
 * properly. This file can also be used as a starting point for future
 * component tests.
 */
describe("Example component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render with no props", () => {
        render(<SimpleExample />);
        expect(screen.getByText("Hello world")).toBeDefined();
    });

    test("Render with custom text", () => {
        render(
            <SimpleExample
                text={`Currently running in a ${
                    getEnvironment().name
                } environment`}
            />
        );
        expect(
            screen.getByText("Currently running in a mock environment")
        ).toBeDefined();
    });

    test("Check a11y", async () => {
        const result = await runAxe(render(<SimpleExample />).container);
        expect(result).toHaveNoViolations();
    });
});
