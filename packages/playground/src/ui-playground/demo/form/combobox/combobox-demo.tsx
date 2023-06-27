/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { TextField } from "@fluentui/react/lib/TextField";
import { ChoiceGroupOnChange, TextFieldOnChange } from "../../../functions";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";

import { PrimaryButton } from "@fluentui/react/lib/Button";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { Icon } from "@fluentui/react/lib/Icon";
import {
    IComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    IComboBoxOptionStyles,
    VirtualizedComboBox,
} from "@fluentui/react/lib/ComboBox";
import { getColorFromString, IColor } from "@fluentui/react/lib/Color";
import {
    ColorPicker,
    IColorPickerStyles,
} from "@fluentui/react/lib/ColorPicker";
import { Toggle } from "@fluentui/react/lib/Toggle";
import { SyntheticEvent } from "react";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoControlContainer } from "../../../layout/demo-control-container";
import { Stack } from "@fluentui/react/lib/Stack";

export const ComboBoxDemo: React.FC = () => {
    const comboBoxRef = React.useRef<IComboBox>(null);

    const INITIAL_OPTIONS: IComboBoxOption[] = [];
    for (let i = 0; i < 10; i++) {
        INITIAL_OPTIONS.push({
            key: `${i}`,
            text: `Option ${i}`,
        });
    }

    /*
     * React useState declarations
     */
    const [labelValue, setLabelValue] = React.useState("Sample text");

    const [options, setOptions] = React.useState(INITIAL_OPTIONS);

    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([
        "C",
        "D",
    ]);

    const [freeformValue, setFreeformValue] = React.useState(false);

    const [selectedKey, setSelectedKey] = React.useState<
        string | number | undefined
    >("C");

    const [multiSelectValue, setMultiSelectValue] = React.useState(false);

    const [disabledValue, setDisabledValue] = React.useState(false);

    const [staticErrorMessageBool, setStaticErrorMessageBool] =
        React.useState(false);

    const [staticErrorMessageValue, setStaticErrorMessageValue] =
        React.useState("");

    //color
    const white = getColorFromString("#ffffff")!;
    const [color, setColor] = React.useState(white);

    const [defaultColorKey, setDefaultColorKey] = React.useState<
        string | undefined
    >("default");

    const [textColorKey, setTextColorKey] = React.useState<string | undefined>(
        "default"
    );

    const [addedValue, setAddedValue] = React.useState<string>("");

    const [changeKey, setChangeKey] = React.useState<string>("");

    const [changeValue, setChangeValue] = React.useState<string>("");

    const [errorMsg, setErrorMsg] = React.useState<string>("");

    const [autoCompleteValue, setAutoCompleteValue] = React.useState(false);

    /*
     * React onChange functions
     */
    const onFreeformChange = React.useCallback(
        (ev, checked?: boolean) => setFreeformValue(!!checked),
        []
    );

    const onMultiSelectChange = React.useCallback(
        (ev, checked?: boolean) => setMultiSelectValue(!!checked),
        []
    );

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledValue(!!checked),
        []
    );

    const onStaticErrorMessageChange = React.useCallback(
        (ev, checked?: boolean) => setStaticErrorMessageBool(!!checked),
        []
    );

    const updateColor = React.useCallback(
        (ev: SyntheticEvent<HTMLElement, Event>, colorObj: IColor) =>
            setColor(colorObj),
        []
    );

    const onAutoCompleteChange = React.useCallback(
        (ev, checked?: boolean) => setAutoCompleteValue(!!checked),
        []
    );

    let newKey = 1;

    //onChange event handler for multi-select combobox
    const multiOnChange = React.useCallback(
        (
            event: React.FormEvent<IComboBox>,
            option?: IComboBoxOption,
            index?: number,
            value?: string
        ): void => {
            let selected = option?.selected;
            if (freeformValue == true && !option && value) {
                selected = true;
                option = { key: `${newKey++}`, text: value };
                setOptions((prevOptions) => [...prevOptions, option!]);
            }

            if (option) {
                setSelectedKeys((prevSelectedKeys) =>
                    selected
                        ? [...prevSelectedKeys, option!.key as string]
                        : prevSelectedKeys.filter((k) => k !== option!.key)
                );
            }
        },
        [freeformValue, newKey]
    );

    //onChange event handler for single-select combobox
    const singleOnChange = React.useCallback(
        (
            event: React.FormEvent<IComboBox>,
            option?: IComboBoxOption,
            index?: number,
            value?: string
        ): void => {
            let key = option?.key;
            if (freeformValue == true && !option && value) {
                key = `${newKey++}`;
                setOptions((prevOptions) => [
                    ...prevOptions,
                    { key: key!, text: value },
                ]);
            }

            setSelectedKey(key);
        },
        [freeformValue, newKey]
    );

    /*
     * Assorted functions
     */

    //This function fills in the combobox's static error message based on whether the user wants to include one
    function fillInErrorMsg(param: string): string {
        if (staticErrorMessageBool) {
            return param;
        } else {
            return "";
        }
    }

    //Returns the hex of the text color that the user selects
    function returnColor() {
        if (textColorKey == "default") {
            return undefined;
        }
        if (textColorKey == "black") {
            return "#000000";
        }
        if (textColorKey == "white") {
            return "#ffffff";
        }
    }

    //Removes the last item from the combobox list
    function removeElement(): void {
        INITIAL_OPTIONS.pop();
        options.pop();
    }

    //Adds item to the bottom of the combobox list
    function addElement(): void {
        options.push({
            key: `${options.length}`,
            text: `${addedValue}`,
        });
    }

    const isFixedString = (s: string) =>
        !isNaN(+s) && isFinite(+s) && !/e/i.test(s);

    // Changes an element at the index that a user enters
    function changeElement(): void {
        const index = parseInt(changeKey);
        if (isFixedString(changeKey) && index < options.length) {
            setErrorMsg("");
            options[index] = { key: index, text: changeValue };
        } else {
            setErrorMsg(
                "ERROR: Please enter a valid number within the list bounds"
            );
        }
    }

    /*
     * Styles
     */
    const comboBoxStyles: Partial<IComboBoxStyles> = {
        root: {
            color: returnColor(),
            width: 400,
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        input: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        optionsContainerWrapper: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        rootHovered: {
            color: returnColor(),
        },
        inputDisabled: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        rootPressed: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        rootDisabled: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
    };

    const comboBoxOptionStyles: Partial<IComboBoxOptionStyles> = {
        root: {
            color: returnColor(),
            maxWidth: 300,
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        rootHovered: {
            color: returnColor(),
        },
        rootPressed: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        rootDisabled: {
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
    };

    return (
        <DemoPane title="ComboBox">
            <DemoComponentContainer minWidth="400px">
                <VirtualizedComboBox
                    componentRef={comboBoxRef}
                    label={labelValue}
                    options={options}
                    styles={comboBoxStyles}
                    multiSelect={multiSelectValue}
                    allowFreeform={freeformValue}
                    autoComplete={autoCompleteValue ? "on" : "off"}
                    errorMessage={fillInErrorMsg(staticErrorMessageValue)}
                    disabled={disabledValue}
                    selectedKey={
                        multiSelectValue == true ? selectedKeys : selectedKey
                    }
                    onChange={
                        multiSelectValue == true
                            ? multiOnChange
                            : singleOnChange
                    }
                    comboBoxOptionStyles={comboBoxOptionStyles}
                />
            </DemoComponentContainer>
            <hr
                style={{
                    color: "purple",
                    backgroundColor: "purple",
                    height: 5,
                }}
            />
            <DemoControlContainer>
                <Stack tokens={{ childrenGap: 8 }}>
                    <TextField
                        label="Item to Add"
                        defaultValue={addedValue}
                        onChange={TextFieldOnChange(setAddedValue)}
                        description="Enter the name of an item to add to the bottom of the combobox list."
                    />
                    <PrimaryButton text="Add Item" onClick={addElement} />
                    <PrimaryButton
                        text="Remove Last Item"
                        onClick={removeElement}
                    />
                </Stack>
                <TextField
                    label="Index of Item"
                    defaultValue={changeKey}
                    errorMessage={errorMsg}
                    onChange={TextFieldOnChange(setChangeKey)}
                    description="Enter the index (any number starting from 0) of the item you want to change."
                />
                <Stack tokens={{ childrenGap: 8 }}>
                    <TextField
                        label="New Value of Item"
                        defaultValue={changeValue}
                        onChange={TextFieldOnChange(setChangeValue)}
                        description="Enter the value of the item you want to change at the above index."
                    />
                    <PrimaryButton text="Change Item" onClick={changeElement} />
                </Stack>
                <TextField
                    label="Text"
                    defaultValue={labelValue}
                    onChange={TextFieldOnChange(setLabelValue)}
                />
                <Toggle
                    label={
                        <div>
                            Freeform{" "}
                            <TooltipHost content="Whether the ComboBox is free form, meaning that the user input is not bound to provided options. Defaults to false.">
                                <Icon
                                    iconName="Info"
                                    aria-label="Info tooltip"
                                />
                            </TooltipHost>
                        </div>
                    }
                    inlineLabel
                    onChange={onFreeformChange}
                    checked={freeformValue}
                />
                <Toggle
                    label={
                        <div>
                            Multiselect{" "}
                            <TooltipHost content="Enables multi-choice selections when set to true.">
                                <Icon
                                    iconName="Info"
                                    aria-label="Info tooltip"
                                />
                            </TooltipHost>
                        </div>
                    }
                    inlineLabel
                    onChange={onMultiSelectChange}
                    checked={multiSelectValue}
                />
                <Toggle
                    label={
                        <div>
                            Disabled{" "}
                            <TooltipHost content="When set to true, it disables the entire menu.">
                                <Icon
                                    iconName="Info"
                                    aria-label="Info tooltip"
                                />
                            </TooltipHost>
                        </div>
                    }
                    inlineLabel
                    onChange={onDisabledChange}
                    checked={disabledValue}
                />
                <Toggle
                    label={
                        <div>
                            Autocomplete{" "}
                            <TooltipHost content="If set to true, while the user is inputting text, it will suggest potential matches from the list of options. This feature is only activated if the freeform toggle is set to True.">
                                <Icon
                                    iconName="Info"
                                    aria-label="Info tooltip"
                                />
                            </TooltipHost>
                        </div>
                    }
                    inlineLabel
                    onChange={onAutoCompleteChange}
                    checked={autoCompleteValue}
                />
                <Toggle
                    label={
                        <div>
                            Would you like to include a static error message?{" "}
                            <TooltipHost content="If set to true, you may input a static error message to be displayed underneath the menu. Otherwise, the error message field is disabled.">
                                <Icon
                                    iconName="Info"
                                    aria-label="Info tooltip"
                                />
                            </TooltipHost>
                        </div>
                    }
                    inlineLabel
                    onChange={onStaticErrorMessageChange}
                    checked={staticErrorMessageBool}
                />
                <TextField
                    label="Static Error Message"
                    value={fillInErrorMsg(staticErrorMessageValue)}
                    onChange={TextFieldOnChange(setStaticErrorMessageValue)}
                    disabled={!staticErrorMessageBool}
                />
                <ChoiceGroup
                    selectedKey={defaultColorKey}
                    options={defaultColorOptions}
                    onChange={ChoiceGroupOnChange(setDefaultColorKey)}
                    label="Background Color"
                />
                <ChoiceGroup
                    selectedKey={textColorKey}
                    options={textColorOptions}
                    onChange={ChoiceGroupOnChange(setTextColorKey)}
                    label="Text Color"
                />
                <ColorPicker
                    color={color}
                    onChange={updateColor}
                    alphaType={"none"}
                    showPreview={true}
                    styles={colorPickerStyles}
                    strings={{}}
                />
            </DemoControlContainer>
        </DemoPane>
    );
};

/*
 * Styling
 */
const colorPickerStyles: Partial<IColorPickerStyles> = {
    panel: { padding: 12 },
    root: {
        maxWidth: 352,
        minWidth: 352,
    },
    colorRectangle: { height: 268 },
};

/*
 * Options
 */
const defaultColorOptions: IChoiceGroupOption[] = [
    { key: "default", text: "Default Color" },
    { key: "custom", text: "Custom Color" },
];

const textColorOptions: IChoiceGroupOption[] = [
    { key: "default", text: "Default" },
    { key: "black", text: "Black" },
    { key: "white", text: "White" },
];
