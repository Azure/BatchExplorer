import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { Link } from "../link";

describe("Link control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render Link Control", async () => {
        const { container } = render(
            <>
                <Link
                    text="Click Me"
                    href="https://developer.microsoft.com/en-us/fluentui#/controls/web/link"
                    underline={true}
                ></Link>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect button element to be undefined
        const button = screen.queryByRole("button");
        expect(button).toBeNull();

        //Expect link element to be present
        const link = screen.getByRole("link");
        expect(link).toBeDefined();

        //Checks that the href attribute (URL) is correct
        const url = screen.getByText("Click Me").getAttribute("href");
        expect(url).toBe(
            "https://developer.microsoft.com/en-us/fluentui#/controls/web/link"
        );
    });
});
