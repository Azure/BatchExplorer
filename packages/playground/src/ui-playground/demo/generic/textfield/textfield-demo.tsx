import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { TextField, ITextFieldStyleProps } from "@fluentui/react/lib/TextField";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { ChoiceGroupOnChange } from "../../../functions";
import { Toggle } from "@fluentui/react/lib/Toggle";
import { Position } from "@fluentui/react/lib/Positioning";
import { TextFieldOnChange } from "../../../functions";
import { SpinButton } from "@fluentui/react/lib/SpinButton";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { Icon } from "@fluentui/react/lib/Icon";
import { HeightAndWidth } from "../../../functions";
import {
    Stack,
    IStackProps,
    IStackStyles,
    IStackTokens,
} from "@fluentui/react/lib/Stack";
import { ITextFieldStyles } from "@fluentui/react/lib/TextField";
import { IStyleFunctionOrObject } from "@uifabric/merge-styles";

export const TextFieldDemo: React.FC = () => {
    const [required, setRequired] = React.useState(false);

    const onRequiredChange = React.useCallback(
        (ev, checked?: boolean) => setRequired(!!checked),
        []
    );

    const [labelValue, setLabelValue] = React.useState("Label");

    const [placeholderValue, setPlaceholderValue] =
        React.useState("Placeholder");

    const [errorMessageValue, setErrorMessageValue] = React.useState("");

    const [descriptionValue, setDescriptionValue] =
        React.useState("Sample Description");

    //Prefix

    const [wantPrefixValue, setWantPrefixValue] = React.useState(false);

    const onWantPrefixValueChange = React.useCallback(
        (ev, checked?: boolean) => setWantPrefixValue(!!checked),
        []
    );

    const [actualPrefixValue, setActualPrefixValue] = React.useState("");

    //Suffix

    const [wantSuffixValue, setWantSuffixValue] = React.useState(false);

    const onWantSuffixValueChange = React.useCallback(
        (ev, checked?: boolean) => setWantSuffixValue(!!checked),
        []
    );

    const [actualSuffixValue, setActualSuffixValue] = React.useState("");

    function standard(param: string, wantValue: boolean): string | undefined {
        if (CheckURL(wantValue) == false) {
            return param;
        } else {
            return undefined;
        }
    }

    function CheckURL(param: boolean | undefined): boolean | undefined {
        return !param;
    }

    const [typeKey, setTypeKey] = React.useState<string | undefined>("normal");

    const typeOptions: IChoiceGroupOption[] = [
        { key: "normal", text: "Normal" },
        { key: "password", text: "Password" },
    ];

    //Disabled

    const [disabledKey, setDisabledKey] = React.useState(false);

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledKey(!!checked),
        []
    );

    //Read only

    const [readOnlyKey, setReadOnlyKey] = React.useState(false);

    const onReadOnlyChange = React.useCallback(
        (ev, checked?: boolean) => setReadOnlyKey(!!checked),
        []
    );

    //Underlined
    const [underlinedKey, setUnderlinedKey] = React.useState(false);

    const onUnderlinedChange = React.useCallback(
        (ev, checked?: boolean) => setUnderlinedKey(!!checked),
        []
    );

    //Borderless
    const [borderlessKey, setBorderlessKey] = React.useState(false);

    const onBorderlessChange = React.useCallback(
        (ev, checked?: boolean) => setBorderlessKey(!!checked),
        []
    );

    //Multiline
    const [multilineKey, setMultilineKey] = React.useState(false);

    const onMultilineChange = React.useCallback(
        (ev, checked?: boolean) => setMultilineKey(!!checked),
        []
    );

    //Resizable
    const [resizableKey, setResizableKey] = React.useState(false);

    const onResizableChange = React.useCallback(
        (ev, checked?: boolean) => setResizableKey(!!checked),
        []
    );

    //Auto Adjust Height
    const [autoAdjustHeightKey, setAutoAdjustHeightKey] = React.useState(false);

    const onAutoAdjustHeightChange = React.useCallback(
        (ev, checked?: boolean) => setAutoAdjustHeightKey(!!checked),
        []
    );

    const min = 3;
    const max = 100;

    /** Remove the suffix or any other text after the numbers, or return undefined if not a number */
    const getNumericPart = (value: string): number | undefined => {
        const valueRegex = /^(\d+(\.\d+)?).*/;
        if (valueRegex.test(value)) {
            const numericValue = Number(value.replace(valueRegex, "$1"));
            return isNaN(numericValue) ? undefined : numericValue;
        }
        return undefined;
    };

    const [rowsKey, setRowsKey] = React.useState("3");

    /** Increment the value (or return nothing to keep the previous value if invalid) */
    const onIncrement = (
        value: string,
        event?: React.SyntheticEvent<HTMLElement>
    ): string | void => {
        const numericValue = getNumericPart(value);
        console.log("heyyyy" + value);
        if (numericValue !== undefined) {
            setRowsKey(String(Math.min(numericValue + 1, max)));
            return String(Math.min(numericValue + 1, max));
        }
    };

    /** Decrement the value (or return nothing to keep the previous value if invalid) */
    const onDecrement = (
        value: string,
        event?: React.SyntheticEvent<HTMLElement>
    ): string | void => {
        const numericValue = getNumericPart(value);
        console.log("Decrement" + value);
        if (numericValue !== undefined) {
            setRowsKey(String(Math.max(numericValue - 1, min)));
            return String(Math.max(numericValue - 1, min));
        }
    };

    const sectionStackTokens: IStackTokens = { childrenGap: 50 };
    const wrapStackTokens: IStackTokens = { childrenGap: 200 };

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

    const searchBoxStyles:
        | IStyleFunctionOrObject<ITextFieldStyleProps, ITextFieldStyles>
        | undefined = {
        root: {
            width: 400,
        },
        /* field: {
            color: "#000000",
        }, */
    };

    return (
        <DemoPane title="Textfield">
            {/* Remove the div style to un-shorten the element*/}
            <div style={{ display: "flex", justifyContent: "center" }}>
                <TextField
                    label={labelValue}
                    defaultValue="Default value"
                    disabled={disabledKey}
                    required={required}
                    readOnly={readOnlyKey}
                    placeholder={placeholderValue}
                    type={typeKey} //normal or password
                    canRevealPassword={true}
                    errorMessage={errorMessageValue}
                    multiline={multilineKey}
                    rows={+rowsKey}
                    resizable={resizableKey}
                    autoAdjustHeight={autoAdjustHeightKey}
                    underlined={underlinedKey}
                    description={descriptionValue}
                    borderless={borderlessKey}
                    prefix={standard(actualPrefixValue, wantPrefixValue)}
                    suffix={standard(actualSuffixValue, wantSuffixValue)}
                    styles={searchBoxStyles}
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
                                    label="Label"
                                    defaultValue={labelValue}
                                    onChange={TextFieldOnChange(setLabelValue)}
                                />

                                <TextField
                                    label="Placeholder"
                                    defaultValue={placeholderValue}
                                    onChange={TextFieldOnChange(
                                        setPlaceholderValue
                                    )}
                                />

                                <TextField
                                    label="Description"
                                    defaultValue={descriptionValue}
                                    onChange={TextFieldOnChange(
                                        setDescriptionValue
                                    )}
                                />

                                <TextField
                                    label="Error Message"
                                    defaultValue={errorMessageValue}
                                    onChange={TextFieldOnChange(
                                        setErrorMessageValue
                                    )}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <Toggle
                                    label={
                                        <div>
                                            Would you like to include a prefix?{" "}
                                            <TooltipHost content="If set to true, you may input a prefix to be displayed before the text field contents. Otherwise, the prefix field is disabled.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onWantPrefixValueChange}
                                    checked={wantPrefixValue}
                                />
                                <TextField
                                    label="Prefix"
                                    value={standard(
                                        actualPrefixValue,
                                        wantPrefixValue
                                    )}
                                    onChange={TextFieldOnChange(
                                        setActualPrefixValue
                                    )}
                                    disabled={CheckURL(wantPrefixValue)}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Would you like to include a suffix?{" "}
                                            <TooltipHost content="If set to true, you may input a suffix to be displayed after the text field contents. Otherwise, the suffix field is disabled.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onWantSuffixValueChange}
                                    checked={wantSuffixValue}
                                />
                                <TextField
                                    label="Suffix"
                                    value={standard(
                                        actualSuffixValue,
                                        wantSuffixValue
                                    )}
                                    onChange={TextFieldOnChange(
                                        setActualSuffixValue
                                    )}
                                    disabled={CheckURL(wantSuffixValue)}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <ChoiceGroup
                                    selectedKey={typeKey}
                                    options={typeOptions}
                                    onChange={ChoiceGroupOnChange(setTypeKey)}
                                    label="Type: Normal or Password"
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Disabled{" "}
                                            <TooltipHost content="Disabled state of the text field.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onDisabledChange}
                                    checked={disabledKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Required{" "}
                                            <TooltipHost content="Indicates whether it is mandatory that a text field be filled out.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onRequiredChange}
                                    checked={required}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Read Only{" "}
                                            <TooltipHost content="If true, the text field is read-only (cannot be edited).">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onReadOnlyChange}
                                    checked={readOnlyKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Underlined{" "}
                                            <TooltipHost content="Whether or not the text field is underlined.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onUnderlinedChange}
                                    checked={underlinedKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Borderless{" "}
                                            <TooltipHost content="When set to true, the border enclosing the text field disappears.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onBorderlessChange}
                                    checked={borderlessKey}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <h2>Multiline Settings</h2>
                                <Toggle
                                    label={
                                        <div>
                                            Multiline{" "}
                                            <TooltipHost content="When set to true, the text field can become multiple lines long. If false, the field is only a single line long.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onMultilineChange}
                                    checked={multilineKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Resizable{" "}
                                            <TooltipHost content="For multiline text fields, whether or not the field is resizable. This feature is only activated if multiline is set to true.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onResizableChange}
                                    checked={resizableKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Auto Adjust Height{" "}
                                            <TooltipHost content="For multiline text fields, whether or not to auto adjust text field height. This feature is only activated if multiline is set to true.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onAutoAdjustHeightChange}
                                    checked={autoAdjustHeightKey}
                                />

                                <SpinButton
                                    label="Number of rows [use up/down arrow keys]"
                                    onIncrement={onIncrement}
                                    onDecrement={onDecrement}
                                    min={min}
                                    max={max}
                                    //onChange={}
                                    labelPosition={Position.end}
                                />
                            </Stack>
                        </span>
                    </Stack>
                </Stack>
            </div>
        </DemoPane>
    );
};
