import { StringParameter } from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createParam } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { FormContainer } from "../form-container";
import { RadioButton } from "../radio-button";

describe("Checkbox control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render radio buttons", async () => {
        const { container } = render(
            <>
                <RadioButton
                    param={createParam(StringParameter, {
                        label: "First checkbox",
                        value: "A",
                    })}
                    id="radiobutton"
                    options={[
                        { key: "A", text: "Option A" },
                        { key: "B", text: "Option B" },
                        { key: "C", text: "Option C" },
                    ]}
                ></RadioButton>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        const ddEl = screen.getByRole("radiogroup");
        expect(ddEl).toBeDefined();

        const item1 = ddEl
            .getElementsByClassName("ms-ChoiceField-input")[0]
            .getAttribute("id");
        expect(item1).toBe("ChoiceGroup0-A");

        const item2 = ddEl
            .getElementsByClassName("ms-ChoiceField-input")[2]
            .getAttribute("type");
        expect(item2).toBe("radio");
    });

    test("Radio button in form", async () => {
        const user = userEvent.setup();
        const param = createParam(StringParameter, {
            label: "First checkbox",
            value: "A",
            render: (props) => {
                return (
                    <RadioButton
                        {...props}
                        options={[
                            { key: "A", text: "Option A" },
                            { key: "B", text: "Option B" },
                            { key: "C", text: "Option C" },
                        ]}
                    ></RadioButton>
                );
            },
        });

        const { container } = render(<FormContainer form={param.parentForm} />);
        const ddEl = screen.getByRole("radiogroup");
        expect(ddEl).toBeDefined();
        const options = ddEl.getElementsByClassName("ms-ChoiceField-input");
        expect(options.length).toBe(3);

        expect(param.value).toBe("A");
        await user.click(options[2]);
        expect(param.value).toBe("C");

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
