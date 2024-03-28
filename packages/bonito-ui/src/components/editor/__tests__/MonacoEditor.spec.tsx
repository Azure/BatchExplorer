import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { MonacoEditor } from "../MonacoEditor";
import { initMockBrowserEnvironment } from "../../../environment";

// set timeout to 60 seconds since it needs to transpile the monaco editor
jest.setTimeout(60000);

describe("MonacoEditor", () => {
    beforeEach(() => initMockBrowserEnvironment());
    it("renders", async () => {
        const { getByTestId } = render(<MonacoEditor />);
        await waitFor(
            () => {
                expect(getByTestId("monaco-container")).toBeTruthy();
            },
            {
                timeout: 60000,
            }
        );
    });
});
