import { BooleanParameter } from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createReactForm, createParam } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { Checkbox } from "../checkbox";

describe("Checkbox control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render checkbox control", async () => {
        const spy = jest.fn();
        const user = userEvent.setup();
        const { container } = render(
            <>
                <Checkbox
                    param={createParam(BooleanParameter, {
                        value: false,
                        label: "First checkbox",
                    })}
                    ariaLabel="First checkbox aria-label"
                    onChange={spy}
                ></Checkbox>

                <Checkbox
                    param={createParam(BooleanParameter, {
                        value: true,
                        label: "Second checkbox",
                    })}
                ></Checkbox>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect 2 checkbox elements to be present
        const ddEl = screen.getAllByRole("checkbox");
        expect(ddEl.length).toBe(2);

        //Expect 'Button' to not be defined
        expect(() => screen.getByText("Button")).toThrow(
            /Unable to find an element/
        );

        //Expect checkbox's onChange method to work correctly
        expect(spy).toBeCalledTimes(0);
        await user.click(screen.getByLabelText("First checkbox aria-label"));
        expect(spy).toBeCalledTimes(1);
    });

    test("Simulate the checking of a checkbox", async () => {
        const user = userEvent.setup();
        const form = createReactForm({
            values: {
                yesOrNo: false,
            },
        });
        const yesOrNoParam = form.param("yesOrNo", BooleanParameter, {});
        render(<Checkbox param={yesOrNoParam} />);
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
        expect(checkbox.checked).toEqual(false);
        await user.click(checkbox);
        expect(checkbox.checked).toEqual(true);
    });
});
