import { Checkbox } from "@batch/ui-react/lib/components/form/checkbox";
import { ComboBox } from "@batch/ui-react/lib/components/form/combobox";
import { RadioButton } from "@batch/ui-react/lib/components/form/radio-button";
import { TextField } from "@batch/ui-react/lib/components/form/text-field";
import * as React from "react";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoPane } from "../../../layout/demo-pane";
import {
    checkboxOnChange,
    newTextfieldOnChange,
    radioButtonOnChange,
} from "../../../new-functions";

//Rewritten version of combobox-demo.tsx using shared libraries wrapped combobox control instead of Fluent UI control directly

export const NewComboBoxDemo: React.FC = () => {
    const [labelValue, setLabelValue] = React.useState("Label");

    const [disabledKey, setDisabledKey] = React.useState<boolean>(false);
    const [hiddenKey, setHiddenKey] = React.useState<boolean>(false);

    const [multiSelectKey, setMultiSelectKey] =
        React.useState<string>("singleselect");

    const [freeformKey, setFreeformKey] = React.useState<boolean>(false);
    const [autoCompleteKey, setAutoCompleteKey] =
        React.useState<boolean>(false);

    const [placeholderValue, setPlaceholderValue] =
        React.useState("Placeholder");

    //Function to convert autocomplete checkbox boolean to valid autocomplete values
    function convertAutoCompleteValues() {
        if (autoCompleteKey) {
            return "on";
        } else if (!autoCompleteKey) {
            return "off";
        } else {
            return undefined;
        }
    }

    const ColoredLine = () => (
        <hr
            style={{
                color: "purple",
                backgroundColor: "purple",
                height: 5,
            }}
        />
    );

    const [check, setCheckMsg] = React.useState<boolean>(false);

    const [errorMsg, setErrorMsg] = React.useState("");

    return (
        <>
            <DemoPane title="ComboBox">
                <DemoComponentContainer minWidth="400px">
                    <ComboBox
                        label={labelValue}
                        options={[
                            { key: "vm", text: "Virtual Machine" },
                            { key: "ks", text: "Kubernetes Service" },
                            { key: "acd", text: "Azure Cosmos DB" },
                            { key: "sqld", text: "SQL Database" },
                            { key: "sa", text: "Storage Account" },
                            { key: "ds", text: "DevOps Starter" },
                            { key: "wa", text: "Web App" },
                        ]}
                        disabled={disabledKey}
                        hidden={hiddenKey}
                        errorMessage={check ? errorMsg : ""}
                        placeholder={placeholderValue}
                        multiSelect={multiSelectKey == "multiselect"}
                        allowFreeform={freeformKey}
                        autoComplete={convertAutoCompleteValues()}
                        defaultSelectedKey="3"
                    ></ComboBox>
                </DemoComponentContainer>
                <ColoredLine />

                <div
                    style={{
                        marginTop: "32px",
                        display: "grid",

                        justifyItems: "center",
                        gap: "20px",
                        rowGap: "32px",
                        columnGap: "16px",
                    }}
                >
                    <TextField
                        label="Combobox Label"
                        value={labelValue}
                        onChange={newTextfieldOnChange(setLabelValue)}
                    ></TextField>

                    <TextField
                        label="Placeholder"
                        value={placeholderValue}
                        onChange={newTextfieldOnChange(setPlaceholderValue)}
                    ></TextField>
                    <br></br>
                    <RadioButton
                        label="Multiselect status"
                        selectedKey={multiSelectKey}
                        options={[
                            {
                                key: "singleselect",
                                text: "Single Select (default)",
                            },
                            { key: "multiselect", text: "Multiselect" },
                        ]}
                        onChange={radioButtonOnChange(setMultiSelectKey)}
                    ></RadioButton>
                    <br></br>

                    <Checkbox
                        label="Disabled"
                        checked={disabledKey}
                        onChange={checkboxOnChange(setDisabledKey)}
                    ></Checkbox>

                    <Checkbox
                        label="Hidden?"
                        checked={hiddenKey}
                        onChange={checkboxOnChange(setHiddenKey)}
                    ></Checkbox>

                    <Checkbox
                        label="Freeform status"
                        checked={freeformKey}
                        onChange={checkboxOnChange(setFreeformKey)}
                    ></Checkbox>
                    <Checkbox
                        label="Autocomplete status [must enable freeform to use this]"
                        disabled={!freeformKey}
                        checked={autoCompleteKey}
                        onChange={checkboxOnChange(setAutoCompleteKey)}
                    ></Checkbox>
                    <br></br>
                    <Checkbox
                        label="Would you like to add a static error message?"
                        checked={check}
                        onChange={checkboxOnChange(setCheckMsg)}
                    ></Checkbox>
                    <TextField
                        label="Error Message"
                        disabled={!check}
                        value={errorMsg}
                        onChange={newTextfieldOnChange(setErrorMsg)}
                    ></TextField>
                </div>
            </DemoPane>
        </>
    );
};
