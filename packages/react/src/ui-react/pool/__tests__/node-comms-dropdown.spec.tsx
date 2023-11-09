import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../environment";
import { createParam } from "../../form";
import { NodeCommsDropdown } from "../node-comms-dropdown";
import { NodeCommsParameter } from "../node-comms-parameter";

describe("Node communication mode dropdown tests", () => {
    let user: UserEvent;

    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
    });

    test("dropdown options", async () => {
        const param = createParam(NodeCommsParameter);
        render(<NodeCommsDropdown param={param} />);

        const dropdown = screen.getByRole("combobox");
        expect(param.value).toBeUndefined();

        await user.click(dropdown);

        const options = screen.getAllByRole("option");
        expect(options.length).toEqual(3);
        expect(options.map((option) => option.textContent)).toEqual([
            "Default",
            "Simplified",
            "Classic",
        ]);

        await user.click(options[2]);
        expect(param.value).toEqual("Classic");
        // KLUDGE: Fluent UI dropdowns don't set the value attribute,
        //         so check text content
        expect(dropdown.textContent).toEqual("Classic");
    });
});
