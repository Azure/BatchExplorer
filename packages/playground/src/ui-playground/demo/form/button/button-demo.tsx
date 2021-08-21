import { Slider } from "@fluentui/react/lib/Slider";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import {
    IStackProps,
    IStackStyles,
    Stack,
    IStackTokens,
} from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import React from "react";
import {
    ChoiceGroupOnChange,
    ICONS,
    Item,
    TextFieldOnChange,
    HeightAndWidth,
    UrlOnChange,
} from "../../../functions";
import { headingStyle } from "../../../style";
import { DemoPane } from "../../../layout/demo-pane";

/* This variable exists to test the number of times that the default (first)
   button has been clicked (see the test file) */
export let testCount = 0;

export const ButtonDemo: React.FC = () => {
    /*
     * React useState declarations [not including padding/margin]
     */
    const [labelValue, setLabelValue] = React.useState("Button");

    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(
        "primary"
    );

    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    const [checkedKey, setCheckedKey] = React.useState<string | undefined>(
        "unchecked"
    );

    const [urlKey, setUrlKey] = React.useState<string | undefined>("nourl");

    const [normalButtonUrlValue, setNormalButtonUrlValue] = React.useState("");

    const [errorMsg, setErrorMsg] = React.useState("");

    const [disabledIconKey, setDisabledIconKey] = React.useState<
        string | undefined
    >("nondisabled");

    const [checkedIconKey, setCheckedIconKey] = React.useState<
        string | undefined
    >("unchecked");

    const [iconUrlKey, setIconUrlKey] = React.useState<string | undefined>(
        "nourl"
    );

    const [iconButtonUrlValue, setIconButtonUrlValue] = React.useState("");

    const [iconErrorMsg, setIconErrorMsg] = React.useState("");

    const [result, setResult] = React.useState<Item[] | undefined>();

    const [query, setQuery] = React.useState("Add");

    const [alignKey, setAlignKey] = React.useState<string | undefined>(
        "center"
    );

    const [iconAlignKey, setIconAlignKey] = React.useState<string | undefined>(
        "center"
    );

    /*
     * Functions
     */
    const emojiIcon: IIconProps = { iconName: query };

    const filterItems = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const enteredName = (event.target as HTMLTextAreaElement).value;
            setQuery(enteredName);

            const foundItems = ICONS.filter((item) =>
                item.name.toLowerCase().includes(enteredName.toLowerCase())
            );
            setResult(foundItems);
        },
        []
    );

    // When a user clicks on any of the items in the icon name dropdown, this function
    // automatically populates the textfield with the name of that item.
    function PopulateTextfield(param: string): void {
        setQuery(param);

        const foundItem = ICONS.filter((item) =>
            item.name.toLowerCase().includes(param.toLowerCase())
        );
        setResult(foundItem);
    }

    /*
     * Padding Sliders - Normal Button
     */
    const [paddingSliderValue, setPaddingSliderValue] = React.useState(15);
    const paddingSliderOnChange = (value: number) => {
        setPaddingSliderValue(value);
        setPaddingSliderLeftValue(value);
        setPaddingSliderRightValue(value);
        setPaddingSliderTopValue(value);
        setPaddingSliderBottomValue(value);
    };

    const [paddingSliderLeftValue, setPaddingSliderLeftValue] =
        React.useState(15);
    const paddingSliderLeftOnChange = (value: number) =>
        setPaddingSliderLeftValue(value);

    const [paddingSliderRightValue, setPaddingSliderRightValue] =
        React.useState(15);
    const paddingSliderRightOnChange = (value: number) =>
        setPaddingSliderRightValue(value);

    const [paddingSliderTopValue, setPaddingSliderTopValue] =
        React.useState(15);
    const paddingSliderTopOnChange = (value: number) =>
        setPaddingSliderTopValue(value);

    /*
     * Margin Sliders - Normal Button
     */
    const [marginSliderValue, setMarginSliderValue] = React.useState(0);
    const marginSliderOnChange = (value: number) => {
        setMarginSliderValue(value);
        setMarginSliderLeftValue(value);
        setMarginSliderRightValue(value);
        setMarginSliderTopValue(value);
        setMarginSliderBottomValue(value);
    };

    const [marginSliderLeftValue, setMarginSliderLeftValue] = React.useState(0);
    const marginSliderLeftOnChange = (value: number) =>
        setMarginSliderLeftValue(value);

    const [marginSliderRightValue, setMarginSliderRightValue] =
        React.useState(0);
    const marginSliderRightOnChange = (value: number) =>
        setMarginSliderRightValue(value);

    const [marginSliderTopValue, setMarginSliderTopValue] = React.useState(0);
    const marginSliderTopOnChange = (value: number) =>
        setMarginSliderTopValue(value);

    const [marginSliderBottomValue, setMarginSliderBottomValue] =
        React.useState(0);
    const marginSliderBottomOnChange = (value: number) =>
        setMarginSliderBottomValue(value);

    /*
     * Font Size - Normal Button
     */
    const [fontValue, setFontValue] = React.useState(12);
    const fontOnChange = (value: number) => setFontValue(value);

    const [paddingSliderBottomValue, setPaddingSliderBottomValue] =
        React.useState(15);

    const paddingSliderBottomOnChange = (value: number) =>
        setPaddingSliderBottomValue(value);

    /*
     * Styles the normal button based on the padding, margin, and font size parameters set directly above
     */
    const newStyle = {
        padding: paddingSliderValue,

        paddingLeft: paddingSliderLeftValue,
        paddingRight: paddingSliderRightValue,
        paddingTop: paddingSliderTopValue,
        paddingBottom: paddingSliderBottomValue,

        margin: marginSliderValue,

        marginLeft: marginSliderLeftValue,
        marginBottom: marginSliderBottomValue,
        marginRight: marginSliderRightValue,
        marginTop: marginSliderTopValue,

        fontSize: fontValue,
    };

    /*
     * Padding Sliders - Icon Button
     */

    const [iconPaddingSliderValue, setIconPaddingSliderValue] =
        React.useState(15);
    const iconPaddingSliderOnChange = (value: number) => {
        setIconPaddingSliderValue(value);
        setIconPaddingSliderLeftValue(value);
        setIconPaddingSliderRightValue(value);
        setIconPaddingSliderTopValue(value);
        setIconPaddingSliderBottomValue(value);
    };

    const [iconPaddingSliderLeftValue, setIconPaddingSliderLeftValue] =
        React.useState(15);
    const iconPaddingSliderLeftOnChange = (value: number) =>
        setIconPaddingSliderLeftValue(value);

    const [iconPaddingSliderRightValue, setIconPaddingSliderRightValue] =
        React.useState(15);
    const iconPaddingSliderRightOnChange = (value: number) =>
        setIconPaddingSliderRightValue(value);

    const [iconPaddingSliderTopValue, setIconPaddingSliderTopValue] =
        React.useState(15);
    const iconPaddingSliderTopOnChange = (value: number) =>
        setIconPaddingSliderTopValue(value);

    /*
     * Margin Sliders - Icon Button
     */
    const [iconMarginSliderValue, setIconMarginSliderValue] = React.useState(0);
    const iconMarginSliderOnChange = (value: number) => {
        setIconMarginSliderValue(value);
        setIconMarginSliderLeftValue(value);
        setIconMarginSliderRightValue(value);
        setIconMarginSliderTopValue(value);
        setIconMarginSliderBottomValue(value);
    };

    const [iconMarginSliderLeftValue, setIconMarginSliderLeftValue] =
        React.useState(0);
    const iconMarginSliderLeftOnChange = (value: number) =>
        setIconMarginSliderLeftValue(value);

    const [iconMarginSliderRightValue, setIconMarginSliderRightValue] =
        React.useState(0);
    const iconMarginSliderRightOnChange = (value: number) =>
        setIconMarginSliderRightValue(value);

    const [iconMarginSliderTopValue, setIconMarginSliderTopValue] =
        React.useState(0);
    const iconMarginSliderTopOnChange = (value: number) =>
        setIconMarginSliderTopValue(value);

    const [iconMarginSliderBottomValue, setIconMarginSliderBottomValue] =
        React.useState(0);
    const iconMarginSliderBottomOnChange = (value: number) =>
        setIconMarginSliderBottomValue(value);

    const [iconPaddingSliderBottomValue, setIconPaddingSliderBottomValue] =
        React.useState(15);

    const iconPaddingSliderBottomOnChange = (value: number) =>
        setIconPaddingSliderBottomValue(value);

    /*
     * Styles
     */
    // Styles the icon button based on the padding and margin parameters set directly above
    const iconStyle = {
        padding: iconPaddingSliderValue,

        paddingLeft: iconPaddingSliderLeftValue,
        paddingRight: iconPaddingSliderRightValue,
        paddingTop: iconPaddingSliderTopValue,
        paddingBottom: iconPaddingSliderBottomValue,

        margin: iconMarginSliderValue,

        marginLeft: iconMarginSliderLeftValue,
        marginBottom: iconMarginSliderBottomValue,
        marginRight: iconMarginSliderRightValue,
        marginTop: iconMarginSliderTopValue,
    };

    const stackTokens = { childrenGap: HeightAndWidth()[1] / 30 }; //gap between the columns - 30

    // Mutating styles definition
    const stackStyles: IStackStyles = {
        root: {
            width: HeightAndWidth()[1] - HeightAndWidth()[1] / 6,
            display: "flex",
            justifyContent: "center",
        },
    };

    /*
     * Function that increments the testCount variable when clicked.
     * Used in test file to test whether the normal button's onClick function was executed correctly
     */
    function defaultButtonClicked(): void {
        testCount++;
    }

    return (
        <DemoPane title="Default Button">
            {/* Normal Button component */}
            <div style={{ display: "flex", justifyContent: alignKey }}>
                <DefaultButton
                    id="btn"
                    data-testid="btn"
                    name="NormalButton"
                    primary={selectedKey == "primary"}
                    text={labelValue}
                    allowDisabledFocus={true}
                    disabled={disabledKey == "disabled"}
                    checked={checkedKey == "checked"}
                    ariaDescription="hello"
                    ariaLabel="hello"
                    href={userHyperlink(urlKey, errorMsg, normalButtonUrlValue)}
                    target="_blank"
                    style={newStyle}
                    onClick={defaultButtonClicked}
                />
            </div>
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
                            {/* Textfield for assigning text label to button */}
                            <TextField
                                name="NormalLabel"
                                label="Text"
                                defaultValue={labelValue}
                                onChange={TextFieldOnChange(setLabelValue)}
                            />
                            <ChoiceGroup
                                name="NormalAlignStatus"
                                selectedKey={alignKey}
                                options={alignOptions}
                                onChange={ChoiceGroupOnChange(setAlignKey)}
                                label="Align status"
                            />
                            {/* ChoiceGroup for assigning style (primary/default) to button */}
                            <ChoiceGroup
                                name="NormalStyle"
                                selectedKey={selectedKey}
                                options={styleOptions}
                                onChange={ChoiceGroupOnChange(setSelectedKey)}
                                label="Choose a style"
                            />
                            <ChoiceGroup
                                name="NormalDisabledStatus"
                                selectedKey={disabledKey}
                                options={disabledOptions}
                                onChange={ChoiceGroupOnChange(setDisabledKey)}
                                label="Disabled status"
                            />
                        </Stack>
                    </span>
                    <span>
                        <Stack {...columnProps}>
                            <Slider
                                label="Font Size"
                                min={0}
                                max={100}
                                value={fontValue}
                                onChange={fontOnChange}
                            />
                            <ChoiceGroup
                                name="NormalCheckedStatus"
                                selectedKey={checkedKey}
                                options={checkedOptions}
                                onChange={ChoiceGroupOnChange(setCheckedKey)}
                                label="Checked status"
                            />
                            <ChoiceGroup
                                name="NormalHyperlinkStatus"
                                selectedKey={urlKey}
                                options={urlOptions}
                                onChange={ChoiceGroupOnChange(setUrlKey)}
                                label="Would you like to include a hyperlink?"
                            />
                            <TextField
                                name="NormalActualURL"
                                label="URL"
                                value={fillInURLTextbox(
                                    normalButtonUrlValue,
                                    urlKey
                                )}
                                onChange={UrlOnChange(
                                    setErrorMsg,
                                    setNormalButtonUrlValue
                                )}
                                errorMessage={fillInURLTextbox(
                                    errorMsg,
                                    urlKey
                                )}
                                disabled={urlKey == "url" ? false : true}
                            />
                        </Stack>
                    </span>
                    <span>
                        <Stack {...columnProps}>
                            <Slider
                                label="Padding Slider"
                                min={15}
                                max={100}
                                value={paddingSliderValue}
                                onChange={paddingSliderOnChange}
                            />
                            <Slider
                                label="Padding Slider Left"
                                min={15}
                                max={100}
                                value={paddingSliderLeftValue}
                                onChange={paddingSliderLeftOnChange}
                            />
                            <Slider
                                label="Padding Slider Right"
                                min={15}
                                max={100}
                                value={paddingSliderRightValue}
                                onChange={paddingSliderRightOnChange}
                            />
                            <Slider
                                label="Padding Slider Top"
                                min={15}
                                max={100}
                                value={paddingSliderTopValue}
                                onChange={paddingSliderTopOnChange}
                            />
                            <Slider
                                label="Padding Slider Bottom"
                                min={15}
                                max={100}
                                value={paddingSliderBottomValue}
                                onChange={paddingSliderBottomOnChange}
                            />
                        </Stack>
                    </span>
                    <span>
                        <Stack {...columnProps}>
                            <Slider
                                label="Margin Slider"
                                min={0}
                                max={100}
                                value={marginSliderValue}
                                onChange={marginSliderOnChange}
                            />
                            <Slider
                                label="Margin Slider Left"
                                min={0}
                                max={100}
                                value={marginSliderLeftValue}
                                onChange={marginSliderLeftOnChange}
                            />
                            <Slider
                                label="Margin Slider Right"
                                min={0}
                                max={100}
                                value={marginSliderRightValue}
                                onChange={marginSliderRightOnChange}
                            />
                            <Slider
                                label="Margin Slider Top"
                                min={0}
                                max={100}
                                value={marginSliderTopValue}
                                onChange={marginSliderTopOnChange}
                            />
                            <Slider
                                label="Margin Slider Bottom"
                                min={0}
                                max={100}
                                value={marginSliderBottomValue}
                                onChange={marginSliderBottomOnChange}
                            />
                        </Stack>
                    </span>
                </Stack>
            </Stack>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Stack
                    horizontal
                    horizontalAlign="center"
                    tokens={stackTokens}
                    styles={stackStyles}
                ></Stack>
            </div>

            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 10,
                }}
            />

            <h1 style={headingStyle}> Icon Button</h1>
            <div style={{ display: "flex", justifyContent: iconAlignKey }}>
                <IconButton
                    name="IconButton"
                    iconProps={emojiIcon}
                    ariaLabel="Emoji"
                    allowDisabledFocus={true}
                    disabled={disabledIconKey == "disabled"}
                    checked={checkedIconKey == "checked"}
                    href={userHyperlink(
                        iconUrlKey,
                        iconErrorMsg,
                        iconButtonUrlValue
                    )}
                    target="_blank"
                    size={50}
                    style={iconStyle}
                />
            </div>
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
                                    name="Enter icon name"
                                    label="Enter an icon name [example: Delete]"
                                    value={query}
                                    onChange={filterItems}
                                />

                                {/* Display search result */}
                                <div className="search-result">
                                    {result && result.length > 0 ? (
                                        result.map((item) => (
                                            <li key={item.id} className="item">
                                                <DefaultButton
                                                    onClick={() =>
                                                        PopulateTextfield(
                                                            item.name
                                                        )
                                                    }
                                                    text={item.name}
                                                />
                                            </li>
                                        ))
                                    ) : (
                                        <h2>No items found!</h2>
                                    )}
                                </div>
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <ChoiceGroup
                                    name="IconAlignStatus"
                                    selectedKey={iconAlignKey}
                                    options={alignOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setIconAlignKey
                                    )}
                                    label="Align status for icon"
                                />
                                <ChoiceGroup
                                    name="IconDisabledStatus"
                                    selectedKey={disabledIconKey}
                                    options={disabledOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setDisabledIconKey
                                    )}
                                    label="Disabled status for icon"
                                />

                                <ChoiceGroup
                                    name="IconCheckedStatus"
                                    selectedKey={checkedIconKey}
                                    options={checkedOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setCheckedIconKey
                                    )}
                                    label="Checked status for icon"
                                />
                                <ChoiceGroup
                                    name="IconHyperlink"
                                    selectedKey={iconUrlKey}
                                    options={urlOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setIconUrlKey
                                    )}
                                    label="Would you like to include a hyperlink for the icon?"
                                />
                                <TextField
                                    name="IconActualURL"
                                    label="URL"
                                    value={fillInURLTextbox(
                                        iconButtonUrlValue,
                                        iconUrlKey
                                    )}
                                    onChange={UrlOnChange(
                                        setIconErrorMsg,
                                        setIconButtonUrlValue
                                    )}
                                    errorMessage={fillInURLTextbox(
                                        iconErrorMsg,
                                        iconUrlKey
                                    )}
                                    disabled={
                                        iconUrlKey == "url" ? false : true
                                    }
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <Slider
                                    label="Padding Slider"
                                    min={15}
                                    max={100}
                                    value={iconPaddingSliderValue}
                                    onChange={iconPaddingSliderOnChange}
                                />
                                <Slider
                                    label="Padding Slider Left"
                                    min={15}
                                    max={100}
                                    value={iconPaddingSliderLeftValue}
                                    onChange={iconPaddingSliderLeftOnChange}
                                />
                                <Slider
                                    label="Padding Slider Right"
                                    min={15}
                                    max={100}
                                    value={iconPaddingSliderRightValue}
                                    onChange={iconPaddingSliderRightOnChange}
                                />
                                <Slider
                                    label="Padding Slider Top"
                                    min={15}
                                    max={100}
                                    value={iconPaddingSliderTopValue}
                                    onChange={iconPaddingSliderTopOnChange}
                                />
                                <Slider
                                    label="Padding Slider Bottom"
                                    min={15}
                                    max={100}
                                    value={iconPaddingSliderBottomValue}
                                    onChange={iconPaddingSliderBottomOnChange}
                                />
                            </Stack>
                        </span>
                        <span>
                            <Stack {...columnProps}>
                                <Slider
                                    label="Margin Slider"
                                    min={0}
                                    max={100}
                                    value={iconMarginSliderValue}
                                    onChange={iconMarginSliderOnChange}
                                />
                                <Slider
                                    label="Margin Slider Left"
                                    min={0}
                                    max={100}
                                    value={iconMarginSliderLeftValue}
                                    onChange={iconMarginSliderLeftOnChange}
                                />
                                <Slider
                                    label="Margin Slider Right"
                                    min={0}
                                    max={100}
                                    value={iconMarginSliderRightValue}
                                    onChange={iconMarginSliderRightOnChange}
                                />
                                <Slider
                                    label="Margin Slider Top"
                                    min={0}
                                    max={100}
                                    value={iconMarginSliderTopValue}
                                    onChange={iconMarginSliderTopOnChange}
                                />
                                <Slider
                                    label="Margin Slider Bottom"
                                    min={0}
                                    max={100}
                                    value={iconMarginSliderBottomValue}
                                    onChange={iconMarginSliderBottomOnChange}
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
 * This function takes in user input on whether they want to include a hyperlink or not and,
 * based on that, fills in the URL text field value with the user's input
 */
function userHyperlink(
    theUrlKey: string | undefined,
    theError: string,
    finalResult: string
): string {
    if (theUrlKey == "url" && theError == "") {
        return finalResult;
    } else {
        return "";
    }
}

/*
 * This function fills in the URL textbox if the user wants to include a URL (and doesn't if they don't).
 */
function fillInURLTextbox(
    textFieldContents: string,
    givenUrlKey: string | undefined
): string {
    if (givenUrlKey == "url") {
        return textFieldContents;
    } else {
        return "";
    }
}

/*
 * Styles for the setting columns
 */
const columnProps: Partial<IStackProps> = {
    tokens: { childrenGap: 55 },
    styles: {
        root: {
            width: window.screen.availWidth / 5.5, //window.screen.availWidth / 5.5
            display: "flex",
            justifyContent: "center",
            align: "center",
        },
    },
};

/*
 * Tokens definitions
 */
const sectionStackTokens: IStackTokens = { childrenGap: 10 };
const wrapStackTokens: IStackTokens = { childrenGap: 30 };

/*
 * Options
 */
const styleOptions: IChoiceGroupOption[] = [
    { key: "primary", text: "Primary" },
    { key: "standard", text: "Standard" },
];

const disabledOptions: IChoiceGroupOption[] = [
    { key: "nondisabled", text: "nondisabled" },
    { key: "disabled", text: "disabled" },
];

const checkedOptions: IChoiceGroupOption[] = [
    { key: "unchecked", text: "Unchecked" },
    { key: "checked", text: "Checked" },
];

const urlOptions: IChoiceGroupOption[] = [
    { key: "nourl", text: "No" },
    { key: "url", text: "Yes" },
];

//Alignment options for normal button (left, right, or center)
const alignOptions: IChoiceGroupOption[] = [
    { key: "flex-start", text: "Left" },
    { key: "center", text: "Middle" },
    { key: "flex-end", text: "Right" },
];
