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
    /*
     * React useState declarations
     */
    const [required, setRequired] = React.useState(false);

    const [labelValue, setLabelValue] = React.useState("Label");

    const [placeholderValue, setPlaceholderValue] =
        React.useState("Placeholder");

    const [errorMessageValue, setErrorMessageValue] = React.useState("");

    const [descriptionValue, setDescriptionValue] =
        React.useState("Sample Description");

    const [wantPrefixValue, setWantPrefixValue] = React.useState(false);

    const [actualPrefixValue, setActualPrefixValue] = React.useState("");

    const [wantSuffixValue, setWantSuffixValue] = React.useState(false);

    const [actualSuffixValue, setActualSuffixValue] = React.useState("");

    const [typeKey, setTypeKey] = React.useState<string | undefined>("normal");

    const [disabledKey, setDisabledKey] = React.useState(false);

    const [readOnlyKey, setReadOnlyKey] = React.useState(false);

    const [underlinedKey, setUnderlinedKey] = React.useState(false);

    const [borderlessKey, setBorderlessKey] = React.useState(false);

    const [multilineKey, setMultilineKey] = React.useState(false);

    const [resizableKey, setResizableKey] = React.useState(false);

    const [autoAdjustHeightKey, setAutoAdjustHeightKey] = React.useState(false);

    const [rowsKey, setRowsKey] = React.useState("3");

    /*
     * onChange methods
     */
    const onRequiredChange = React.useCallback(
        (ev, checked?: boolean) => setRequired(!!checked),
        []
    );

    const onWantPrefixValueChange = React.useCallback(
        (ev, checked?: boolean) => setWantPrefixValue(!!checked),
        []
    );

    const onWantSuffixValueChange = React.useCallback(
        (ev, checked?: boolean) => setWantSuffixValue(!!checked),
        []
    );

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledKey(!!checked),
        []
    );

    const onReadOnlyChange = React.useCallback(
        (ev, checked?: boolean) => setReadOnlyKey(!!checked),
        []
    );

    const onUnderlinedChange = React.useCallback(
        (ev, checked?: boolean) => setUnderlinedKey(!!checked),
        []
    );

    const onBorderlessChange = React.useCallback(
        (ev, checked?: boolean) => setBorderlessKey(!!checked),
        []
    );

    const onMultilineChange = React.useCallback(
        (ev, checked?: boolean) => setMultilineKey(!!checked),
        []
    );

    const onResizableChange = React.useCallback(
        (ev, checked?: boolean) => setResizableKey(!!checked),
        []
    );

    const onAutoAdjustHeightChange = React.useCallback(
        (ev, checked?: boolean) => setAutoAdjustHeightKey(!!checked),
        []
    );

    /*
     * Assorted functions
     */

    /** Populates the textfield with a prefix and/or suffix if the user wants to add them in */
    function prefixAndSuffixChecker(
        param: string,
        wantValue: boolean
    ): string | undefined {
        if (wantValue) {
            return param;
        } else {
            return undefined;
        }
    }

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

    /** Increment the value (or return nothing to keep the previous value if invalid) */
    const onIncrement = (value: string): string | void => {
        const numericValue = getNumericPart(value);
        if (numericValue !== undefined) {
            setRowsKey(String(Math.min(numericValue + 1, max)));
            return String(Math.min(numericValue + 1, max));
        }
    };

    /** Decrement the value (or return nothing to keep the previous value if invalid) */
    const onDecrement = (value: string): string | void => {
        const numericValue = getNumericPart(value);
        if (numericValue !== undefined) {
            setRowsKey(String(Math.max(numericValue - 1, min)));
            return String(Math.max(numericValue - 1, min));
        }
    };

    /*
     * Styles
     */
    const stackStyles: IStackStyles = {
        root: {
            width: HeightAndWidth()[1] - HeightAndWidth()[1] / 6,
            display: "flex",
            justifyContent: "center",
        },
    };

    return (
        <DemoPane title="Textfield">
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
                    prefix={prefixAndSuffixChecker(
                        actualPrefixValue,
                        wantPrefixValue
                    )}
                    suffix={prefixAndSuffixChecker(
                        actualSuffixValue,
                        wantSuffixValue
                    )}
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
                                    value={prefixAndSuffixChecker(
                                        actualPrefixValue,
                                        wantPrefixValue
                                    )}
                                    onChange={TextFieldOnChange(
                                        setActualPrefixValue
                                    )}
                                    disabled={!wantPrefixValue}
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
                                    value={prefixAndSuffixChecker(
                                        actualSuffixValue,
                                        wantSuffixValue
                                    )}
                                    onChange={TextFieldOnChange(
                                        setActualSuffixValue
                                    )}
                                    disabled={!wantSuffixValue}
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

/*
 * Styling
 */
const sectionStackTokens: IStackTokens = { childrenGap: 50 };
const wrapStackTokens: IStackTokens = { childrenGap: 200 };

const columnProps: Partial<IStackProps> = {
    tokens: { childrenGap: 55 },
    styles: {
        root: {
            width: window.screen.availWidth / 8,
            display: "flex",
            justifyContent: "center",
            align: "center",
        },
    },
};

const searchBoxStyles:
    | IStyleFunctionOrObject<ITextFieldStyleProps, ITextFieldStyles>
    | undefined = {
    root: {
        width: 400,
    },
};

/*
 * Options
 */
const typeOptions: IChoiceGroupOption[] = [
    { key: "normal", text: "Normal" },
    { key: "password", text: "Password" },
];
