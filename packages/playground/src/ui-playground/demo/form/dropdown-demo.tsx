import { StringParameter } from "@batch/ui-common/lib/form";
import { createParam } from "@batch/ui-react";
import { Dropdown } from "@batch/ui-react/lib/components/form/dropdown";
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
                    param={createParam(StringParameter)}
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
