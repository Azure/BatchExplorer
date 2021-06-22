import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { Toggle } from "@fluentui/react/lib/Toggle";
import { TextField } from "@fluentui/react/lib/TextField";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { Link } from "@fluentui/react/lib/Link";

import {
    TextFieldOnChange,
    ChoiceGroupOnChange,
    UrlOnChange,
} from "../../../functions";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import {
    IStackProps,
    IStackStyles,
    IStackTokens,
} from "@fluentui/react/lib/Stack";
import { HeightAndWidth } from "../../../functions";

export const CheckboxDemo: React.FC = () => {
    /*
     * React useState declarations
     */
    const [isChecked, setIsChecked] = React.useState(false);

    const [disabledValue, setDisabledValue] = React.useState(false);

    const [boxEndKey, setBoxEndKey] = React.useState<
        "start" | "end" | undefined
    >("start");

    const [indeterminateValue, setIndeterminateValue] = React.useState(false);

    const [alignKey, setAlignKey] = React.useState<string | undefined>(
        "center"
    );

    const [secondValue, setSecondValue] = React.useState("Link to the");

    const [placeholderValue, setPlaceholderValue] = React.useState(
        "Microsoft home page"
    );

    const [urlValue, setUrlValue] = React.useState("https://www.microsoft.com");

    const [errorMsg, setErrorMsg] = React.useState("");

    const [textUrlOrderKey, setTextUrlOrderKey] = React.useState<
        string | undefined
    >("textfirst");

    /*
     * React onChange functions
     */
    const onChange = React.useCallback(
        (
            ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
            checked?: boolean
        ): void => {
            setIsChecked(!!checked);
        },
        []
    );

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledValue(!!checked),
        []
    );

    const onIndeterminateChange = React.useCallback(
        (ev, checked?: boolean) => setIndeterminateValue(!!checked),
        []
    );

    /*
     * Functions
     */
    /**  This function is a modified version of the ChoiceGroupOnChange function for
     the box-end parameter, which only accepts specific string values. */
    function ModifiedChoiceGroupOnChange(
        param: React.Dispatch<React.SetStateAction<"start" | "end" | undefined>>
    ): (
        ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
        option?: IChoiceGroupOption | undefined
    ) => void {
        function Result(
            ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
            option?: IChoiceGroupOption
        ): void {
            if (option?.key == "end") {
                param("end");
            } else {
                param("start");
            }
        }

        return Result;
    }

    // Renders the text first or the URL first based on what option the user selects
    function _renderLabelWithLink() {
        if (textUrlOrderKey == "textfirst") {
            return (
                <span>
                    {secondValue}{" "}
                    <Link
                        href={linkChecker(errorMsg, urlValue)}
                        target="_blank"
                        underline
                    >
                        {placeholderValue}
                    </Link>
                </span>
            );
        } else {
            return (
                <span>
                    <Link
                        href={linkChecker(errorMsg, urlValue)}
                        target="_blank"
                        underline
                    >
                        {placeholderValue}
                    </Link>{" "}
                    {secondValue}
                </span>
            );
        }
    }

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
        <DemoPane title="Checkbox">
            <div style={{ display: "flex", justifyContent: alignKey }}>
                <Checkbox
                    checked={isChecked}
                    onChange={onChange}
                    disabled={disabledValue}
                    boxSide={boxEndKey}
                    indeterminate={indeterminateValue}
                    onRenderLabel={_renderLabelWithLink}
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
                                    label="Text"
                                    defaultValue={secondValue}
                                    onChange={TextFieldOnChange(setSecondValue)}
                                />

                                <TextField
                                    label="Actual URL"
                                    defaultValue={urlValue}
                                    onChange={UrlOnChange(
                                        setErrorMsg,
                                        setUrlValue
                                    )}
                                    errorMessage={errorMsg}
                                />

                                <TextField
                                    label="URL Placeholder"
                                    defaultValue={placeholderValue}
                                    onChange={TextFieldOnChange(
                                        setPlaceholderValue
                                    )}
                                />

                                <Toggle
                                    label={
                                        <div>
                                            Disabled{" "}
                                            <TooltipHost content="Disabled state of the checkbox.">
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
                                            Indeterminate{" "}
                                            <TooltipHost content="Controlled indeterminate visual state for checkbox.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onIndeterminateChange}
                                    checked={indeterminateValue}
                                />

                                <ChoiceGroup
                                    selectedKey={textUrlOrderKey}
                                    options={textUrlOrderOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setTextUrlOrderKey
                                    )}
                                    label="Text first or second?"
                                />

                                <ChoiceGroup
                                    selectedKey={boxEndKey}
                                    options={boxEndOptions}
                                    onChange={ModifiedChoiceGroupOnChange(
                                        setBoxEndKey
                                    )}
                                    label="Box end status"
                                />

                                <ChoiceGroup
                                    selectedKey={alignKey}
                                    options={alignOptions}
                                    onChange={ChoiceGroupOnChange(setAlignKey)}
                                    label="Alignment"
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
 * This function fills in the URL text field value with the user's input
 * based on whether there is an error message
 */
function linkChecker(theError: string, finalResult: string): string {
    if (theError == "") {
        return finalResult;
    } else {
        return "";
    }
}

/*
 * Styling
 */
const sectionStackTokens: IStackTokens = { childrenGap: 10 };
const wrapStackTokens: IStackTokens = { childrenGap: 30 };

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

/*
 * Options
 */
const textUrlOrderOptions: IChoiceGroupOption[] = [
    { key: "textfirst", text: "Text First" },
    { key: "urlfirst", text: "URL First" },
];

const boxEndOptions: IChoiceGroupOption[] = [
    { key: "start", text: "start" },
    { key: "end", text: "end" },
];

const alignOptions: IChoiceGroupOption[] = [
    { key: "flex-start", text: "Left" },
    { key: "center", text: "Middle" },
    { key: "flex-end", text: "Right" },
];
