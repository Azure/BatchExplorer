import * as React from "react";
import {
    Checkbox,
    TextField,
    RadioButton,
} from "@azure/bonito-ui/lib/components/form";
import { createParam } from "@azure/bonito-ui";
import { BooleanParameter, StringParameter } from "@azure/bonito-core/lib/form";
import { DemoPane } from "../../../layout/demo-pane";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoControlContainer } from "../../../layout/demo-control-container";

export const CheckboxDemo: React.FC = () => {
    const [labelValue, setLabelValue] = React.useState("Label");
    const [disabledKey, setDisabledKey] = React.useState<string>("nondisabled");

    return (
        <DemoPane title="Checkbox">
            <DemoComponentContainer>
                <Checkbox
                    param={createParam<boolean>(BooleanParameter, {
                        label: labelValue,
                    })}
                    id="checkboxID"
                    disabled={disabledKey == "disabled"}
                ></Checkbox>
            </DemoComponentContainer>

            <DemoControlContainer>
                <TextField
                    param={createParam(StringParameter, {
                        label: "Checkbox Label",
                        value: labelValue,
                    })}
                    onChange={(_, value) =>
                        setLabelValue(value == null ? "" : value)
                    }
                ></TextField>
                <RadioButton
                    param={createParam(StringParameter, {
                        label: "Disabled status",
                        value: disabledKey,
                    })}
                    options={[
                        { key: "nondisabled", text: "Not disabled" },
                        { key: "disabled", text: "Disabled" },
                    ]}
                    onChange={(_, value) => {
                        if (value) {
                            setDisabledKey(value);
                        }
                    }}
                ></RadioButton>
            </DemoControlContainer>
        </DemoPane>
    );
};
