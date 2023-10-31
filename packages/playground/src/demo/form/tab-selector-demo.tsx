import { StringParameter } from "@azure/bonito-core/lib/form";
import { createParam } from "@azure/bonito-ui";
import { TabSelector, TextField } from "@azure/bonito-ui/lib/components/form";
import { Toggle } from "@fluentui/react/lib/Toggle";
import * as React from "react";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { DemoPane } from "../../layout/demo-pane";

export const TabSelectorDemo: React.FC = () => {
    const [disabled, setDisabled] = React.useState(false);
    const [labelPrefix, setLabelPrefix] = React.useState("Tab");
    const [selectedValue, setSelectedValue] = React.useState("");

    const labelParam = React.useMemo(
        () =>
            createParam<string>(StringParameter, {
                label: "Label prefix",
                value: "Tab",
            }),
        []
    );

    const tabSelectorParam = React.useMemo(
        () => createParam<string>(StringParameter),
        []
    );

    return (
        <DemoPane title="Tab Selector">
            <DemoControlContainer>
                <Toggle
                    label="Disabled"
                    inlineLabel
                    onChange={(_, checked?: boolean) => setDisabled(!!checked)}
                    checked={disabled}
                />
                <TextField
                    param={labelParam}
                    onChange={(_, value) => {
                        setLabelPrefix(value ? String(value) : "Tab");
                    }}
                />
                <div>
                    <strong>Selected value: </strong>
                    {selectedValue}
                </div>
            </DemoControlContainer>
            <DemoComponentContainer minWidth="400px">
                <TabSelector
                    param={tabSelectorParam}
                    disabled={disabled}
                    onChange={(event, value) => {
                        setSelectedValue(value as string);
                    }}
                    options={[
                        {
                            value: "value1",
                            label: `${labelPrefix} One`,
                        },
                        {
                            value: "value2",
                            label: `${labelPrefix} Two`,
                        },
                        {
                            value: "value3",
                            label: `${labelPrefix} Three`,
                        },
                        {
                            value: "value4",
                            label: `${labelPrefix} Four`,
                        },
                        {
                            value: "value5",
                            label: `${labelPrefix} Five`,
                        },
                        {
                            value: "value6",
                            label: `${labelPrefix} Six`,
                        },
                        {
                            value: "value7",
                            label: `${labelPrefix} Seven`,
                        },
                        {
                            value: "value8",
                            label: `${labelPrefix} Eight`,
                        },
                    ]}
                />
            </DemoComponentContainer>
        </DemoPane>
    );
};
