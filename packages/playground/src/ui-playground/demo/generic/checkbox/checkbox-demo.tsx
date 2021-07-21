//import { useAppTheme } from "@batch/ui-react/lib/theme";
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

import { TextFieldOnChange, ChoiceGroupOnChange } from "../../../functions";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import {
    IStackProps,
    IStackStyles,
    IStackTokens,
} from "@fluentui/react/lib/Stack";
import { HeightAndWidth } from "../../../functions";
export const CheckboxDemo: React.FC = (props) => {
    const [isChecked, setIsChecked] = React.useState(false);
    const onChange = React.useCallback(
        (
            ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
            checked?: boolean
        ): void => {
            setIsChecked(!!checked);
        },
        []
    );

    const [disabledValue, setDisabledValue] = React.useState(false);

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledValue(!!checked),
        []
    );

    const [boxEndKey, setBoxEndKey] = React.useState<
        "start" | "end" | undefined
    >("start");

    const boxEndOptions: IChoiceGroupOption[] = [
        { key: "start", text: "start" },
        { key: "end", text: "end" },
    ];

    function ModifiedChoiceGroupOnChange(
        param: React.Dispatch<React.SetStateAction<"start" | "end" | undefined>>
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
                if (option?.key == "end") {
                    param("end");
                } else {
                    param("start");
                }
            },
            []
        );

        return Hello;
    }

    const [indeterminateValue, setIndeterminateValue] = React.useState(false);

    const onIndeterminateChange = React.useCallback(
        (ev, checked?: boolean) => setIndeterminateValue(!!checked),
        []
    );

    const [alignKey, setAlignKey] = React.useState<string | undefined>(
        "center"
    );

    const alignOptions: IChoiceGroupOption[] = [
        { key: "flex-start", text: "Left" },
        { key: "center", text: "Middle" },
        { key: "flex-end", text: "Right" },
    ];

    const [secondValue, setSecondValue] = React.useState("Link to the");

    const [placeholderValue, setPlaceholderValue] = React.useState(
        "Microsoft home page"
    );

    const [urlValue, setUrlValue] = React.useState("https://www.microsoft.com");

    const [errorMsg, setErrorMsg] = React.useState("");

    const onChangeSecondTextFieldValue = React.useCallback(
        (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
        ) => {
            let count = 0;
            const ch = ".";

            let i = 0;
            if (!newValue) {
                //dummy++;
            } else {
                i = newValue.length - 1;
            }

            while (i >= 0) {
                if (newValue?.charAt(i) == ch) {
                    count++;
                }
                i--;
            }

            if (
                (!newValue ||
                    newValue[0] != "h" ||
                    newValue[1] != "t" ||
                    newValue[2] != "t" ||
                    newValue[3] != "p" ||
                    !newValue.includes(".") ||
                    (newValue.indexOf(":") != 4 &&
                        newValue.indexOf(":") != 5) ||
                    (newValue[4] != "s" && newValue[4] != ":") ||
                    count < 2 ||
                    newValue.lastIndexOf(".") == newValue.length - 1) &&
                (!newValue || newValue[0] != "/")
            ) {
                setErrorMsg("Error: Invalid URL (must begin with HTTP or /)");
                setUrlValue(newValue || "");
            } else {
                setErrorMsg("");
                setUrlValue(newValue);
            }
        },
        []
    );

    const [textUrlOrderKey, setTextUrlOrderKey] = React.useState<
        string | undefined
    >("textfirst");

    const textUrlOrderOptions: IChoiceGroupOption[] = [
        { key: "textfirst", text: "Text First" },
        { key: "urlfirst", text: "URL First" },
    ];

    function _renderLabelWithLink() {
        if (textUrlOrderKey == "textfirst") {
            return (
                <span>
                    {secondValue}{" "}
                    <Link href={urlValue} target="_blank" underline>
                        {placeholderValue}
                    </Link>
                </span>
            );
        } else {
            return (
                <span>
                    <Link href={urlValue} target="_blank" underline>
                        {placeholderValue}
                    </Link>{" "}
                    {secondValue}
                </span>
            );
        }
    }

    const sectionStackTokens: IStackTokens = { childrenGap: 10 };
    const wrapStackTokens: IStackTokens = { childrenGap: 30 };

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
                                    onChange={onChangeSecondTextFieldValue}
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
