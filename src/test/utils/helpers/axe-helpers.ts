import { axe } from "jasmine-axe";
import { AxeResults, RunOptions } from "axe-core";

/**
* Runs the globally configured axe function
*/
export async function runAxe(
    html: Element,
    options?: RunOptions
): Promise<AxeResults> {
    if (!process.env.BE_ENABLE_A11Y_TESTING) {
        // Accessibility testing is disabled. Return a fake AxeResults object which
        // always has no violations
        return {
            passes: [],
            violations: [],
            incomplete: [],
            inapplicable: [],
        } as unknown as AxeResults;
    }

    return axe(html, options) as Promise<AxeResults>;
}
