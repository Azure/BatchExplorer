import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { TextField } from "@fluentui/react/lib/TextField";
/* import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { ChoiceGroupOnChange } from "../../../functions"; */
import { Toggle } from "@fluentui/react/lib/index";

export const TextFieldDemo: React.FC = () => {
    const [required, setRequired] = React.useState(false);

    const onRequiredChange = React.useCallback(
        (ev, checked?: boolean) => setRequired(!!checked),
        []
    );

    return (
        <DemoPane title="Textfield">
            <div style={{ display: "flex" }}>
                <TextField
                    label="Sample label"
                    defaultValue="Default value"
                    // onChange={() => {}}
                    disabled={false}
                    required={required}
                    readOnly={false}
                    placeholder="Sample placeholder"
                    type="normal" //normal or password
                    canRevealPassword={true}
                    errorMessage="Sample error message"
                    multiline={false}
                    rows={10}
                    resizable={true}
                    autoAdjustHeight={true}
                    underlined={false}
                    description="Sample description"
                    borderless={false}
                    prefix={undefined}
                    suffix={undefined}
                />
            </div>

            <Toggle
                label="Required? True or False"
                inlineLabel
                onChange={onRequiredChange}
                checked={required}
            />
        </DemoPane>
    );
};
