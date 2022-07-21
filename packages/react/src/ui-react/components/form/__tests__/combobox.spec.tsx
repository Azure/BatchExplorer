import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { ComboBox } from "../combobox";

describe("Combobox control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render combobox control", async () => {
        const { container } = render(
            <>
                <ComboBox
                    label="Batch Features"
                    options={[
                        { key: "job", text: "Job" },
                        { key: "schedule", text: "Job Schedule" },
                        { key: "pool", text: "Pool" },
                        { key: "package", text: "Package" },
                        { key: "cert", text: "Certificate" },
                    ]}
                ></ComboBox>
                <ComboBox
                    label="Resources"
                    options={[
                        { key: "vm", text: "Virtual Machine" },
                        { key: "ks", text: "Kubernetes Service" },
                        { key: "acd", text: "Azure Cosmos DB" },
                        { key: "sqld", text: "SQL Database" },
                        { key: "sa", text: "Storage Account" },
                        { key: "ds", text: "DevOps Starter" },
                        { key: "wa", text: "Web App" },
                    ]}
                ></ComboBox>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect 2 combobox elements to be present
        const ddEl = screen.getAllByRole("combobox");
        expect(ddEl.length).toBe(2);

        //Expect 'Checkbox' to not be defined
        expect(() => screen.getByText("checkbox")).toThrow(
            /Unable to find an element/
        );

        //Expect input to be the first element of the first combobox
        const firstItem = screen.getAllByRole(/combobox/i)[0];
        fireEvent.keyDown(firstItem, { key: "job", code: "KeyJob" });
        expect(firstItem.getAttribute("value")).toBe("Job");
    });
});
