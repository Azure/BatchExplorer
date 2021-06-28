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
    IColorPickerProps,
    updateA,
    Toggle,
} from "@fluentui/react/lib/index";
import { PrimaryButton } from "@fluentui/react/lib/Button";

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

    const [allowFreeformKey, setAllowFreeformKey] = React.useState<
        string | undefined
    >("true");

    const allowFreeformOptions: IChoiceGroupOption[] = [
        { key: "true", text: "true" },
        { key: "false", text: "false" },
    ];

    const [options, setOptions] = React.useState(INITIAL_OPTIONS);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([
        "C",
        "D",
    ]);

    //options;

    let newKey = 1;

    const onChange = React.useCallback(
        (
            event: React.FormEvent<IComboBox>,
            option?: IComboBoxOption,
            index?: number,
            value?: string
        ): void => {
            let selected = option?.selected;
            if (allowFreeformKey == "true" && !option && value) {
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
        [allowFreeformKey]
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
            if (allowFreeformKey == "true" && !option && value) {
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
        [allowFreeformKey]
    );

    function Mane() {
        if (multiSelectKey == "true") {
            return onChange;
        } else {
            return singleOnChange;
        }
    }

    function Wow() {
        if (multiSelectKey == "true") {
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

    const [multiSelectKey, setMultiSelectKey] = React.useState<
        string | undefined
    >("false");

    const multiSelectOptions: IChoiceGroupOption[] = [
        { key: "false", text: "false" },
        { key: "true", text: "true" },
    ];

    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    const disabledOptions: IChoiceGroupOption[] = [
        { key: "nondisabled", text: "nondisabled" },
        { key: "disabled", text: "disabled" },
    ];

    const [autoCompleteKey, setAutoCompleteKey] = React.useState<
        "off" | "on" | undefined
    >("off");

    const autoCompleteOptions: IChoiceGroupOption[] = [
        { key: "off", text: "off" },
        { key: "on", text: "on" },
    ];

    function ModifiedChoiceGroupOnChange(
        param: React.Dispatch<React.SetStateAction<"off" | "on" | undefined>>
    ): (
        ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
        option?: IChoiceGroupOption | undefined
    ) => void {
        // ...
        const Hello = React.useCallback(
            (
                ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
                option?: IChoiceGroupOption
            ) => {
                if (option?.key == "on") {
                    param("on");
                } else {
                    param("off");
                }
            },
            []
        );

        return Hello;
    }

    const [staticErrorMessageKey, setStaticErrorMessageKey] = React.useState<
        string | undefined
    >("no");

    const staticErrorMessageOptions: IChoiceGroupOption[] = [
        { key: "no", text: "no" },
        { key: "yes", text: "yes" },
    ];

    const [secondTextFieldValue, setSecondTextFieldValue] = React.useState("");

    function standard(param: string): string {
        if (CheckURL(staticErrorMessageKey) == false) {
            return param;
        } else {
            return "";
        }
    }

    /*
     * This function returns true if the user wants to include a hyperlink and false if not.
     */
    function CheckURL(param: string | undefined): boolean {
        if (param == "yes") {
            return false;
        } else {
            return true;
        }
    }

    //color
    const white = getColorFromString("#ffffff")!;

    const [color, setColor] = React.useState(white);
    const [showPreview, setShowPreview] = React.useState(true);
    const [alphaType, setAlphaType] =
        React.useState<IColorPickerProps["alphaType"]>("alpha");

    const updateColor = React.useCallback(
        (ev: any, colorObj: IColor) => setColor(colorObj),
        []
    );
    const onShowPreviewClick = React.useCallback(
        (ev: any, checked?: boolean) => setShowPreview(!!checked),
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

    const alphaOptions: IChoiceGroupOption[] = [
        { key: "alpha", text: "Alpha" },
        { key: "transparency", text: "Transparency" },
        { key: "none", text: "None" },
    ];

    const onAlphaTypeChange = React.useCallback(
        (ev: any, option: IChoiceGroupOption = alphaOptions[0]) => {
            if (option.key === "none") {
                // If hiding the alpha slider, remove transparency from the color
                setColor(updateA(color, 100));
            }
            setAlphaType(option.key as IColorPickerProps["alphaType"]);
        },
        [color]
    );

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
            maxWidth: 300,
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

    return (
        <DemoPane title="ComboBox">
            <VirtualizedComboBox
                componentRef={comboBoxRef}
                //defaultSelectedKey="C"
                label={labelValue}
                options={options}
                styles={comboBoxStyles}
                multiSelect={multiSelectKey == "true"}
                allowFreeform={allowFreeformKey == "true"}
                autoComplete={autoCompleteKey}
                errorMessage={standard(secondTextFieldValue)}
                //manipulate color
                disabled={disabledKey == "disabled"}
                selectedKey={Wow()}
                onChange={Mane()}
                comboBoxOptionStyles={comboBoxOptionStyles}
            />
            <TextField
                label="Added value"
                defaultValue={addedValue}
                onChange={TextFieldOnChange(setAddedValue)}
            />
            <PrimaryButton text="Add Element" onClick={addElement} />

            <br></br>
            <br></br>
            <PrimaryButton text="Remove Element" onClick={removeElement} />

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

            <PrimaryButton text="Change Element" onClick={changeElement} />

            <TextField
                label="Text"
                defaultValue={labelValue}
                onChange={TextFieldOnChange(setLabelValue)}
            />
            <ChoiceGroup
                selectedKey={allowFreeformKey}
                options={allowFreeformOptions}
                onChange={ChoiceGroupOnChange(setAllowFreeformKey)}
                label="Freeform status"
            />
            <ChoiceGroup
                selectedKey={multiSelectKey}
                options={multiSelectOptions}
                onChange={ChoiceGroupOnChange(setMultiSelectKey)}
                label="Multi-select status"
            />
            <ChoiceGroup
                selectedKey={disabledKey}
                options={disabledOptions}
                onChange={ChoiceGroupOnChange(setDisabledKey)}
                label="Disabled status"
            />
            <ChoiceGroup
                selectedKey={autoCompleteKey}
                options={autoCompleteOptions}
                onChange={ModifiedChoiceGroupOnChange(setAutoCompleteKey)}
                label="Autocomplete status"
            />
            <ChoiceGroup
                selectedKey={staticErrorMessageKey}
                options={staticErrorMessageOptions}
                onChange={ChoiceGroupOnChange(setStaticErrorMessageKey)}
                label="Would you like to include a static error message?"
            />
            <TextField
                label="Static Error Message"
                value={standard(secondTextFieldValue)}
                onChange={TextFieldOnChange(setSecondTextFieldValue)}
                disabled={CheckURL(staticErrorMessageKey)}
            />
            <ColorPicker
                color={color}
                onChange={updateColor}
                alphaType={alphaType}
                showPreview={showPreview}
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
            <Toggle
                label="Show preview box"
                onChange={onShowPreviewClick}
                checked={showPreview}
            />

            <ChoiceGroup
                label="Alpha slider type"
                options={alphaOptions}
                defaultSelectedKey={alphaOptions[0].key}
                onChange={onAlphaTypeChange}
            />
            <ChoiceGroup
                selectedKey={defaultColorKey}
                options={defaultColorOptions}
                onChange={ChoiceGroupOnChange(setDefaultColorKey)}
                label="Default background color? Yes or no"
            />
            <ChoiceGroup
                selectedKey={textColorKey}
                options={textColorOptions}
                onChange={ChoiceGroupOnChange(setTextColorKey)}
                label="Text color? Default, black, or white"
            />
        </DemoPane>
    );
};
