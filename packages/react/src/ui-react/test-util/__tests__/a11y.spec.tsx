import { destroyEnvironment } from "@batch/ui-common";
import { render } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../..";
import { renderA11y, runAxe } from "../a11y";

/**
 * Test the example component to make sure the testing framework is working
 * properly. This file can also be used as a starting point for future
 * component tests.
 */
describe("Accessiblity testing utility functions", () => {
    beforeEach(() =>
        initMockBrowserEnvironment({
            enableA11yTesting: true,
        })
    );

    test("Can pass a11y test using runAxe", async () => {
        const { container } = render(<img alt="Test image" src="test.png" />);
        const result = await runAxe(container);
        expect(result).toHaveNoViolations();
    });

    test("Can fail a11y test using runAxe", async () => {
        const { container } = render(<img src="test.png" />);
        const result = await runAxe(container);
        // Image needs alt text
        expect(result.violations.length).toBe(1);
        expect(result.violations[0].id).toBe("image-alt");
    });

    test("Can pass a11y test using renderA11y", async () => {
        const { axeResults } = await renderA11y(
            <img alt="Test image" src="test.png" />
        );
        expect(axeResults).toHaveNoViolations();
    });

    test("Can fail a11y test using renderA11y", async () => {
        const { axeResults } = await renderA11y(<img src="test.png" />);
        // Image needs alt text
        expect(axeResults.violations.length).toBe(1);
        expect(axeResults.violations[0].id).toBe("image-alt");
    });

    test("When a11y testing is disabled, there are no violations", async () => {
        const getAxeResults = async () => {
            const { axeResults } = await renderA11y(<img src="test.png" />);
            return axeResults;
        };

        // Has violations when a11y testing is enabled
        const a11yEnabledResults = await getAxeResults();
        expect(a11yEnabledResults.violations.length).toBe(1);
        expect(a11yEnabledResults.violations[0].id).toBe("image-alt");

        // Disable a11y testing
        destroyEnvironment();
        initMockBrowserEnvironment({
            enableA11yTesting: false,
        });

        // Rerunning results in zero violations
        const a11yDisabledResults = await getAxeResults();
        expect(a11yDisabledResults).toHaveNoViolations();
    });

    test("Environment variables can turn on/off a11y testing", async () => {
        // Enable a11y testing via environment var
        destroyEnvironment();
        initMockBrowserEnvironment({
            envVars: {
                BE_ENABLE_A11Y_TESTING: "true",
            },
        });

        const getAxeResults = async () => {
            const { axeResults } = await renderA11y(<img src="test.png" />);
            return axeResults;
        };

        // Has violations when a11y testing is enabled
        const a11yEnabledResults = await getAxeResults();
        expect(a11yEnabledResults.violations.length).toBe(1);
        expect(a11yEnabledResults.violations[0].id).toBe("image-alt");

        // Disable a11y testing via env var
        destroyEnvironment();
        initMockBrowserEnvironment({
            envVars: {
                BE_ENABLE_A11Y_TESTING: undefined,
            },
        });

        // Rerunning results in zero violations
        const a11yDisabledResults = await getAxeResults();
        expect(a11yDisabledResults).toHaveNoViolations();
    });
});
