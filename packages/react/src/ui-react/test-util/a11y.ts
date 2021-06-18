// Import types only to avoid pulling test code into bundles.
// Non-type imports are done at run time as needed.
import type { AxeResults } from "axe-core";
import type { JestAxe, JestAxeConfigureOptions } from "jest-axe";

// Globally configured axe instance
let _axe: JestAxe | null = null;

/**
 * Runs the globally configured axe function
 */
export function axe(html: Element | string): Promise<AxeResults> {
    if (!_axe) {
        throw new Error("Axe has not yet been initialized");
    }
    return _axe(html);
}

/**
 * Initialize a global Axe configuration. This may be called only once.
 * @param axeOptions Axe configuration options. See: https://github.com/dequelabs/axe-core/blob/master/doc/API.md#options-parameter
 */
export async function initializeAxe(
    axeOptions: JestAxeConfigureOptions = {}
): Promise<void> {
    if (_axe) {
        throw new Error("Axe has already been initialized");
    }
    const { configureAxe, toHaveNoViolations } = await import("jest-axe");
    _axe = configureAxe(axeOptions);
    expect.extend(toHaveNoViolations);
}
