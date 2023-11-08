import { initMockBrowserEnvironment } from "@azure/bonito-ui";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";
import { render } from "@testing-library/react";
import { Application } from "components/application";
import * as React from "react";

describe("Application tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Can render the web UI without accessibility violations", async () => {
        const { container } = render(<Application />);
        expect(
            await runAxe(container, {
                rules: {
                    // See https://github.com/microsoft/fluentui/issues/28706
                    "aria-required-children": { enabled: false },
                    // See https://github.com/microsoft/fluentui/issues/18474
                    "empty-table-header": { enabled: false },
                },
            })
        ).toHaveNoViolations();
    });
});
