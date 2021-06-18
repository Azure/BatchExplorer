import { render } from "@testing-library/react";
import * as React from "react";
import { runAxe } from "../a11y";

/**
 * Test the example component to make sure the testing framework is working
 * properly. This file can also be used as a starting point for future
 * component tests.
 */
describe("Accessiblity testing utility functions", () => {
    test("Can pass a11y test", async () => {
        const { container } = render(<img alt="Test image" src="test.png" />);
        const result = await runAxe(container);
        expect(result).toHaveNoViolations();
    });

    test("Can fail a11y test", async () => {
        const { container } = render(<img src="test.png" />);
        const result = await runAxe(container);
        // Image needs alt text
        expect(result.violations.length).toBe(1);
        expect(result.violations[0].id).toBe("image-alt");
    });
});
