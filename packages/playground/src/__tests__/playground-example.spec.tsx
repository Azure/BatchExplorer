import { initMockBrowserEnvironment } from "@azure/bonito-ui";
import { render } from "@testing-library/react";
import * as React from "react";
import { PlaygroundExample } from "../playground-example";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";

describe("Playground tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render the playground", () => {
        render(<PlaygroundExample text="Playground" />);
    });

    test("Render without accessibility violations", async () => {
        const { container } = render(<PlaygroundExample />);

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
