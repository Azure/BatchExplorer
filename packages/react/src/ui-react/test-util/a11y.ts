// Import types only to avoid pulling test code into bundles.
// Non-type imports are done at run time as needed.
import type { queries, Queries } from "@testing-library/dom";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { AxeResults, RunOptions } from "axe-core";
import type { JestAxe, JestAxeConfigureOptions } from "jest-axe";
import { MockBrowserEnvironment } from "..";
import { getMockBrowserEnvironment } from "../environment";

// Globally configured axe instance
let _axe: JestAxe | null = null;

/**
 * A wrapper around react-testing-library's render() function which performs
 * accessibility tests after the container is rendered. Note that this is
 * an async function unlike render() because running aXe is async.
 *
 * @param ui The element to render
 * @param options Render options
 */
export async function renderA11y<
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement
>(
    ui: React.ReactElement,
    options: RenderOptions<Q, Container>
): Promise<RenderResult<Q, Container> & { axeResults: AxeResults }>;
export async function renderA11y(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "queries">
): Promise<RenderResult & { axeResults: AxeResults }>;
export async function renderA11y<
    Q extends Queries,
    Container extends Element | DocumentFragment
>(
    ui: React.ReactElement,
    options?: RenderOptions
): Promise<
    (RenderResult | RenderResult<Q, Container>) & { axeResults: AxeResults }
> {
    if (!expect) {
        throw new Error("renderA11y may only be called from within tests");
    }
    const { render } = await import("@testing-library/react");
    const renderResult = render(ui, options);

    const combinedResult: RenderResult & { axeResults: AxeResults } =
        renderResult as RenderResult & { axeResults: AxeResults };

    combinedResult.axeResults = await runAxe(renderResult.container);

    return combinedResult;
}

/**
 * Runs the globally configured axe function
 */
export async function runAxe(
    html: Element | string,
    options?: RunOptions
): Promise<AxeResults> {
    let env: MockBrowserEnvironment;
    try {
        env = getMockBrowserEnvironment();
    } catch (e) {
        // Give a slightly more useful exception if the current environment
        // isn't a mock browser env
        if (e instanceof Error) {
            throw new Error("Unable to run aXe: " + e.message);
        }
        throw e;
    }

    if (!env.config.enableA11yTesting) {
        // Accessibility testing is disabled. Return a fake AxeResults object which
        // always has no violations
        return {
            passes: [],
            violations: [],
            incomplete: [],
            inapplicable: [],
        } as unknown as AxeResults;
    }

    if (!_axe) {
        throw new Error("aXe was not initialized properly");
    }

    return _axe(html, options);
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
