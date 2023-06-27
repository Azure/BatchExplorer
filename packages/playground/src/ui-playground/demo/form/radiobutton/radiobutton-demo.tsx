import * as React from "react";
import { RadioButton } from "@batch/ui-react/lib/components/form/radio-button";
import { TextField } from "@batch/ui-react/lib/components/form/text-field";
import { createParam } from "@batch/ui-react";
import { StringParameter } from "@batch/ui-common/lib/form";
import { DemoPane } from "../../../layout/demo-pane";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoControlContainer } from "../../../layout/demo-control-container";

export const RadioButtonDemo: React.FC = () => {
    const [labelValue, setLabelValue] = React.useState<string>("Label");

    return (
        <DemoPane title="RadioButton">
            <DemoComponentContainer>
                <RadioButton
                    param={createParam(StringParameter, {
                        label: labelValue,
                    })}
                    options={[
                        { key: "A", text: "Option A" },
                        { key: "B", text: "Option B" },
                        { key: "C", text: "Option C" },
                    ]}
                    defaultSelectedKey="B"
                ></RadioButton>
            </DemoComponentContainer>

            <DemoControlContainer>
                <TextField
                    param={createParam(StringParameter, {
                        label: "Radio Button Label",
                        value: labelValue,
                    })}
                    onChange={(_, value) => {
                        setLabelValue(value == null ? "" : String(value));
                    }}
                ></TextField>
            </DemoControlContainer>
        </DemoPane>
    );
};
