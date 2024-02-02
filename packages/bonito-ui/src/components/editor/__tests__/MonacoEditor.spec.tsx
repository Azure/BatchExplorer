import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { MonacoEditor } from "../MonacoEditor";
import { initMockBrowserEnvironment } from "../../../environment";

describe("MonacoEditor", () => {
    beforeEach(() => initMockBrowserEnvironment());
    it("renders", async () => {
        const { getByTestId } = render(<MonacoEditor />);
        await waitFor(() => {
            expect(getByTestId("monaco-container")).toBeTruthy();
        });
    });
});
