import { StringListParameter } from "@azure/bonito-core/lib/form";
import { initMockBrowserEnvironment } from "../../../environment";
import { createParam } from "../../../form";
import { StringList } from "../string-list";
import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { runAxe } from "../../../test-util";

describe("StringList form control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("renders a list of strings", async () => {
        const { container } = render(
            <>
                <StringList
                    param={createStringListParam()}
                    id="StringList"
                ></StringList>
            </>
        );
        const inputs = screen.getAllByRole("textbox");
        expect(inputs.length).toBe(3);
        expect((inputs[0] as HTMLInputElement).value).toBe("foo");
        expect((inputs[1] as HTMLInputElement).value).toBe("bar");
        expect((inputs[2] as HTMLInputElement).value).toBe("");

        const deleteButtons = screen.getAllByRole("button");
        expect(deleteButtons.length).toBe(2);
        expect(await runAxe(container)).toHaveNoViolations();
    });

    it("adds a new string when the last one is edited", async () => {
        const onChange = jest.fn();
        render(
            <StringList param={createStringListParam()} onChange={onChange} />
        );
        const inputs = screen.getAllByRole("textbox");
        const input = inputs[inputs.length - 1];
        input.focus();
        await userEvent.type(input, "baz");
        expect(onChange).toHaveBeenCalledWith(null, ["foo", "bar", "baz"]);
    });

    it("deletes a string when the delete button is clicked", async () => {
        const onChange = jest.fn();
        render(
            <StringList param={createStringListParam()} onChange={onChange} />
        );
        const deleteButton = screen.getAllByRole("button")[1];
        await userEvent.click(deleteButton);
        expect(onChange).toHaveBeenCalledWith(null, ["foo"]);
    });
});

function createStringListParam() {
    return createParam(StringListParameter, {
        label: "String List",
        value: ["foo", "bar"],
    });
}
