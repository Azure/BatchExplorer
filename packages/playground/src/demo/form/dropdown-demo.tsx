import { StringParameter } from "@azure/bonito-core/lib/form";
import { createParam } from "@azure/bonito-ui";
import { Dropdown } from "@azure/bonito-ui/lib/components/form";
import { Toggle } from "@fluentui/react/lib/Toggle";
import * as React from "react";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { DemoPane } from "../../layout/demo-pane";

export const DropdownDemo: React.FC = () => {
    const [disabled, setDisabled] = React.useState(false);

    return (
        <DemoPane title="Dropdown">
            <DemoComponentContainer minWidth="400px">
                <Dropdown
                    param={createParam<string>(StringParameter)}
                    disabled={disabled}
                    options={[
                        {
                            value: "hello",
                        },
                        {
                            value: "world",
                        },
                    ]}
                />
            </DemoComponentContainer>

            <DemoControlContainer>
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={(_, checked?: boolean) => setDisabled(!!checked)}
                    checked={disabled}
                />
            </DemoControlContainer>
        </DemoPane>
    );
};
