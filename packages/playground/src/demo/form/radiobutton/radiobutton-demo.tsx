import { StringParameter } from "@azure/bonito-core/lib/form";
import { createParam } from "@azure/bonito-ui";
import { RadioButton, TextField } from "@azure/bonito-ui/lib/components/form";
import * as React from "react";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoControlContainer } from "../../../layout/demo-control-container";
import { DemoPane } from "../../../layout/demo-pane";

export const RadioButtonDemo: React.FC = () => {
    const [labelValue, setLabelValue] = React.useState<string>("Label");

    return (
        <DemoPane title="RadioButton">
            <DemoComponentContainer>
                <RadioButton
                    param={createParam<string>(StringParameter, {
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
