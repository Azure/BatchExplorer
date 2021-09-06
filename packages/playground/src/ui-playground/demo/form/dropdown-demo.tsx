import * as React from "react";
import { DemoPane } from "../../layout/demo-pane";
import { Toggle } from "@fluentui/react/lib/Toggle";
import { Dropdown } from "@batch/ui-react/lib/components/form/dropdown";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";

export const DropdownDemo: React.FC = () => {
    const [disabled, setDisabled] = React.useState(false);

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabled(!!checked),
        []
    );

    return (
        <DemoPane title="Dropdown">
            <DemoComponentContainer minWidth="400px">
                <Dropdown
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
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabled}
                />
            </DemoControlContainer>
        </DemoPane>
    );
};
