import * as React from "react";
import { RadioButton } from "@batch/ui-react/lib/components/form/radio-button";
import { TextField } from "@batch/ui-react/lib/components/form/text-field";
import { Stack } from "@fluentui/react/lib/Stack";
import { newTextfieldOnChange } from "../../../new-functions";
//Rewritten version of checkbox-demo.tsx using shared libraries wrapped control instead of Fluent UI control directly

export const RadioButtonDemo: React.FC = () => {
    const stackTokens = { childrenGap: 15 };
    const [labelValue, setLabelValue] = React.useState("Label");

    /* const _onChange = React.useCallback((newValue?: string) => {
        setLabelValue(newValue ?? "");
    }, []); */

    return (
        <>
            <Stack tokens={stackTokens}>
                <RadioButton
                    label={labelValue}
                    options={[
                        { key: "A", text: "Option A" },
                        { key: "B", text: "Option B" },
                        { key: "C", text: "Option C" },
                    ]}
                    defaultSelectedKey="B"
                ></RadioButton>

                <TextField
                    label="Radio Button Label"
                    value={labelValue}
                    onChange={newTextfieldOnChange(setLabelValue)}
                ></TextField>
            </Stack>
        </>
    );
};
