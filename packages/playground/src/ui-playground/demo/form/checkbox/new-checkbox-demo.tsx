import * as React from "react";
import { Checkbox } from "@batch/ui-react/lib/components/form/checkbox";
import { TextField } from "@batch/ui-react/lib/components/form/text-field";
import { Stack } from "@fluentui/react/lib/Stack";
import { RadioButton } from "@batch/ui-react/lib/components/form/radio-button";
import {
    newTextfieldOnChange,
    radioButtonOnChange,
} from "../../../new-functions";
//Rewritten version of checkbox-demo.tsx using shared libraries wrapped control instead of Fluent UI control directly

export const NewCheckboxDemo: React.FC = () => {
    const stackTokens = { childrenGap: 15 };
    const [labelValue, setLabelValue] = React.useState("Label");

    const [disabledKey, setDisabledKey] = React.useState<string>("nondisabled");

    const [boxSideKey, setBoxSideKey] = React.useState<string>("start");

    return (
        <>
            <Stack tokens={stackTokens}>
                <Checkbox
                    id="checkboxID"
                    label={labelValue}
                    disabled={disabledKey == "disabled"}
                    boxSide={
                        boxSideKey == "start" || boxSideKey == "end"
                            ? boxSideKey
                            : undefined
                    }
                ></Checkbox>

                <TextField
                    label="Checkbox Label"
                    value={labelValue}
                    onChange={newTextfieldOnChange(setLabelValue)}
                ></TextField>
                <RadioButton
                    label="Disabled status"
                    selectedKey={disabledKey}
                    options={[
                        { key: "nondisabled", text: "Not disabled" },
                        { key: "disabled", text: "Disabled" },
                    ]}
                    onChange={radioButtonOnChange(setDisabledKey)}
                ></RadioButton>
                <RadioButton
                    label="Checkbox placement"
                    selectedKey={boxSideKey}
                    options={[
                        { key: "start", text: "Before text (default)" },
                        { key: "end", text: "After text" },
                    ]}
                    onChange={radioButtonOnChange(setBoxSideKey)}
                ></RadioButton>
            </Stack>
        </>
    );
};
