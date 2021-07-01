import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import {
    VirtualizedComboBox,
    IComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    IComboBoxOptionStyles,
    // Toggle,
} from "@fluentui/react/lib/";
import { TextField } from "@fluentui/react/lib/TextField";
import { ChoiceGroupOnChange, TextFieldOnChange } from "../../../functions";
//import { useBoolean } from "@fluentui/react/lib/";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import {
    ColorPicker,
    getColorFromString,
    IColorPickerStyles,
    IColor,
    Toggle,
} from "@fluentui/react/lib/index";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import { HeightAndWidth } from "../../../functions";
import {
    IStackProps,
    IStackStyles,
    IStackTokens,
} from "@fluentui/react/lib/Stack";

export const ComboBoxDemo: React.FC = () => {
    const comboBoxRef = React.useRef<IComboBox>(null);

    const INITIAL_OPTIONS: IComboBoxOption[] = [];
    for (let i = 0; i < 10; i++) {
        INITIAL_OPTIONS.push({
            key: `${i}`,
            text: `Option ${i}`,
        });
    }

    //INITIAL_OPTIONS[7] = { key: "meep", text: "milk" };
    //console.log(INITIAL_OPTIONS[7]);

    //we can add new element, pop the last element, and change an existing element

    const [labelValue, setLabelValue] = React.useState("Sample text");

    /* const [selectedKey, setSelectedKey] = React.useState<
        string | number | undefined
    >("C"); */

    const [options, setOptions] = React.useState(INITIAL_OPTIONS);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([
        "C",
        "D",
    ]);

    //options;

    //Freeform Status

    const [freeformValue, setFreeformValue] = React.useState(false);

    const onFreeformChange = React.useCallback(
        (ev, checked?: boolean) => setFreeformValue(!!checked),
        []
    );

    let newKey = 1;

    const onChange = React.useCallback(
        (
            event: React.FormEvent<IComboBox>,
            option?: IComboBoxOption,
            index?: number,
            value?: string
        ): void => {
            let selected = option?.selected;
            if (freeformValue == true && !option && value) {
                // If allowFreeform is true, the newly selected option might be something the user typed that
                // doesn't exist in the options list yet. So there's extra work to manually add it.
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
        [freeformValue]
    );

    const [selectedKey, setSelectedKey] = React.useState<
        string | number | undefined
    >("C");

    const singleOnChange = React.useCallback(
        (
            event: React.FormEvent<IComboBox>,
            option?: IComboBoxOption,
            index?: number,
            value?: string
        ): void => {
            let key = option?.key;
            if (freeformValue == true && !option && value) {
                // If allowFreeform is true, the newly selected option might be something the user typed that
                // doesn't exist in the options list yet. So there's extra work to manually add it.
                key = `${newKey++}`;
                setOptions((prevOptions) => [
                    ...prevOptions,
                    { key: key!, text: value },
                ]);
            }

            setSelectedKey(key);
        },
        [freeformValue]
    );

    function Mane() {
        if (multiSelectValue == true) {
            return onChange;
        } else {
            return singleOnChange;
        }
    }

    function Wow() {
        if (multiSelectValue == true) {
            return selectedKeys;
        } else {
            return selectedKey;
        }
    }

    /*  function Milk() {
        if (allowFreeformKey == "true") {
            return true;
        } else {
            return false;
        }
    } */

    //New Multiselect
    const [multiSelectValue, setMultiSelectValue] = React.useState(false);

    const onMultiSelectChange = React.useCallback(
        (ev, checked?: boolean) => setMultiSelectValue(!!checked),
        []
    );

    //New Disabled

    const [disabledValue, setDisabledValue] = React.useState(false);

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledValue(!!checked),
        []
    );

    //NEW Static Error Message
    const [staticErrorMessageValue, setStaticErrorMessageValue] =
        React.useState(false);

    const onStaticErrorMessageChange = React.useCallback(
        (ev, checked?: boolean) => setStaticErrorMessageValue(!!checked),
        []
    );

    const [secondTextFieldValue, setSecondTextFieldValue] = React.useState("");

    function standard(param: string): string {
        if (CheckURL(staticErrorMessageValue) == false) {
            return param;
        } else {
            return "";
        }
    }

    /*
     * This function returns true if the user wants to include a hyperlink and false if not.
     */
    function CheckURL(param: boolean): boolean {
        if (param == true) {
            return false;
        } else {
            return true;
        }
    }

    //color
    const white = getColorFromString("#ffffff")!;

    const [color, setColor] = React.useState(white);

    const updateColor = React.useCallback(
        (ev: any, colorObj: IColor) => setColor(colorObj),
        []
    );

    const colorPickerStyles: Partial<IColorPickerStyles> = {
        panel: { padding: 12 },
        root: {
            maxWidth: 352,
            minWidth: 352,
        },
        colorRectangle: { height: 268 },
    };

    const [defaultColorKey, setDefaultColorKey] = React.useState<
        string | undefined
    >("default");

    const defaultColorOptions: IChoiceGroupOption[] = [
        { key: "default", text: "Default Color" },
        { key: "custom", text: "Customized Color" },
    ];

    const [textColorKey, setTextColorKey] = React.useState<string | undefined>(
        "default"
    );

    const textColorOptions: IChoiceGroupOption[] = [
        { key: "default", text: "default" },
        { key: "black", text: "black" },
        { key: "white", text: "white" },
    ];

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

    const comboBoxStyles: Partial<IComboBoxStyles> = {
        root: {
            color: returnColor(),
            width: 400,
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
        },
        input: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        optionsContainerWrapper: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        rootHovered: {
            //color: textColorKey,
            color: returnColor(),
            //backgroundColor:
            //    defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        inputDisabled: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        rootPressed: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        rootDisabled: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
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
            //color: textColorKey,
            color: returnColor(),
            // backgroundColor:
            //    defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        rootPressed: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        rootDisabled: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        },
        /*  optionTextWrapper: {
            //color: textColorKey,
            color: returnColor(),
            backgroundColor:
                defaultColorKey == "custom" ? "#" + color.hex : undefined,
            //backgroundColor: undefined,
        }, */
    };

    function removeElement(): void {
        INITIAL_OPTIONS.pop();
        options.pop();
    }

    const [addedValue, setAddedValue] = React.useState<string>("");

    function addElement(): void {
        //TextFieldOnChange(setAddedValue);

        options.push({
            key: `${options.length}`,
            text: `Option ${addedValue}`,
        });

        console.log("INITIAL_OPTIONS: " + INITIAL_OPTIONS.values);
    }

    const [changeKey, setChangeKey] = React.useState<string>("");

    const [changeValue, setChangeValue] = React.useState<string>("");

    const [errorMsg, setErrorMsg] = React.useState<string>("");

    //INITIAL_OPTIONS[7] = { key: "meep", text: "milk" };
    //console.log(INITIAL_OPTIONS[7]);

    const isFixedString = (s: string) =>
        !isNaN(+s) && isFinite(+s) && !/e/i.test(s);

    function changeElement(): void {
        const milk = parseInt(changeKey);
        //const bool = isNaN(milk);
        if (isFixedString(changeKey) && milk < options.length) {
            setErrorMsg("");
            options[milk] = { key: milk, text: changeValue };
        } else {
            setErrorMsg(
                "ERROR: Please enter a valid number within the list bounds"
            );
        }

        //options[milk] = { key: milk, text: changeValue };

        //setChangeKey("");
        //setChangeValue("");
    }

    //New autocomplete

    const [autoCompleteValue, setAutoCompleteValue] = React.useState(false);

    const onAutoCompleteChange = React.useCallback(
        (ev, checked?: boolean) => setAutoCompleteValue(!!checked),
        []
    );

    const sectionStackTokens: IStackTokens = { childrenGap: 50 };
    const wrapStackTokens: IStackTokens = { childrenGap: 400 };

    // Mutating styles definition
    const stackStyles: IStackStyles = {
        root: {
            width: HeightAndWidth()[1] - HeightAndWidth()[1] / 6,
            display: "flex",
            justifyContent: "center",
            //align: "center",
        },
    };

    const columnProps: Partial<IStackProps> = {
        tokens: { childrenGap: 55 },
        styles: {
            root: {
                width: window.screen.availWidth / 8, //window.screen.availWidth / 5.5
                display: "flex",
                justifyContent: "center",
                align: "center",
                //overflowX: "scroll",
                // overflowY: "scroll",
            },
        },
    };

    return (
        <DemoPane title="ComboBox">
            <div style={{ display: "flex", justifyContent: "center" }}>
                <VirtualizedComboBox
                    componentRef={comboBoxRef}
                    //defaultSelectedKey="C"
                    label={labelValue}
                    options={options}
                    styles={comboBoxStyles}
                    multiSelect={multiSelectValue}
                    allowFreeform={freeformValue}
                    autoComplete={autoCompleteValue ? "on" : "off"}
                    errorMessage={standard(secondTextFieldValue)}
                    //manipulate color
                    disabled={disabledValue}
                    selectedKey={Wow()}
                    onChange={Mane()}
                    comboBoxOptionStyles={comboBoxOptionStyles}
                />
            </div>
            <br></br>
            <br></br>
            <hr
                style={{
                    color: "purple",
                    backgroundColor: "purple",
                    height: 5,
                }}
            />
            <br></br>
            <br></br>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Stack tokens={sectionStackTokens}>
                    <Stack
                        horizontal
                        horizontalAlign="center"
                        wrap
                        styles={stackStyles}
                        tokens={wrapStackTokens}
                    >
                        <span>
                            <Stack {...columnProps}>
                                <TextField
                                    label="Added value"
                                    defaultValue={addedValue}
                                    onChange={TextFieldOnChange(setAddedValue)}
                                />
                                <PrimaryButton
                                    text="Add Element"
                                    onClick={addElement}
                                />

                                <br></br>
                                <br></br>
                                <PrimaryButton
                                    text="Remove Element"
                                    onClick={removeElement}
                                />

                                <TextField
                                    label="Changed Key"
                                    defaultValue={changeKey}
                                    errorMessage={errorMsg}
                                    onChange={TextFieldOnChange(setChangeKey)}
                                />

                                <TextField
                                    label="Changed Value"
                                    defaultValue={changeValue}
                                    onChange={TextFieldOnChange(setChangeValue)}
                                />

                                <PrimaryButton
                                    text="Change Element"
                                    onClick={changeElement}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
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
                                            Would you like to include a static
                                            error message?{" "}
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
                                    checked={staticErrorMessageValue}
                                />
                                <TextField
                                    label="Static Error Message"
                                    value={standard(secondTextFieldValue)}
                                    onChange={TextFieldOnChange(
                                        setSecondTextFieldValue
                                    )}
                                    disabled={CheckURL(staticErrorMessageValue)}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <ChoiceGroup
                                    selectedKey={defaultColorKey}
                                    options={defaultColorOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setDefaultColorKey
                                    )}
                                    label="Background color"
                                />
                                <ColorPicker
                                    color={color}
                                    onChange={updateColor}
                                    alphaType={"none"}
                                    showPreview={true}
                                    styles={colorPickerStyles}
                                    // The ColorPicker provides default English strings for visible text.
                                    // If your app is localized, you MUST provide the `strings` prop with localized strings.
                                    strings={
                                        {
                                            // By default, the sliders will use the text field labels as their aria labels.
                                            // Previously this example had more detailed instructions in the labels, but this is
                                            // a bad practice and not recommended. Labels should be concise, and match visible text when possible.
                                            //hueAriaLabel: "Hue",
                                        }
                                    }
                                />

                                <ChoiceGroup
                                    selectedKey={textColorKey}
                                    options={textColorOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setTextColorKey
                                    )}
                                    label="Text color? Default, black, or white"
                                />
                            </Stack>
                        </span>
                    </Stack>
                </Stack>
            </div>
        </DemoPane>
    );
};
