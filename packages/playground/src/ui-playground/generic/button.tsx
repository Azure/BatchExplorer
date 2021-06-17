import React from "react";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { TextField } from "@fluentui/react/lib/TextField";
import { headingStyle } from "../style";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import {
    TextFieldOnChange,
    ChoiceGroupOnChange,
    Item,
    ICONS,
} from "../functions";
import { IIconProps } from "@fluentui/react/lib/";
import { IconButton } from "@fluentui/react/lib/Button";
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();
import { Slider } from "@fluentui/react/lib/";
import { Stack, IStackProps, IStackStyles } from "@fluentui/react/lib/Stack";
import { MonacoEditor } from "@batch/ui-react/lib/components";

export const Button: React.FC = () => {
    const [labelValue, setLabelValue] = React.useState("");
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(
        "primary"
    );

    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    /* const [disabledFocusKey, setDisabledFocusKey] = React.useState<
        string | undefined
    >("focus"); */

    const [checkedKey, setCheckedKey] = React.useState<string | undefined>(
        "unchecked"
    );

    const [urlKey, setUrlKey] = React.useState<string | undefined>("nourl");

    const styleOptions: IChoiceGroupOption[] = [
        { key: "primary", text: "Primary" },
        { key: "standard", text: "Standard" },
    ];

    const disabledOptions: IChoiceGroupOption[] = [
        { key: "nondisabled", text: "nondisabled" },
        { key: "disabled", text: "disabled" },
    ];

    /* const allowDisabledFocusOptions: IChoiceGroupOption[] = [
        { key: "focus", text: "Focus" },
        { key: "nofocus", text: "No focus" },
    ]; */

    const checkedOptions: IChoiceGroupOption[] = [
        { key: "unchecked", text: "Unchecked" },
        { key: "checked", text: "Checked" },
    ];

    const urlOptions: IChoiceGroupOption[] = [
        { key: "nourl", text: "No" },
        { key: "url", text: "Yes" },
    ];

    const [secondTextFieldValue, setSecondTextFieldValue] = React.useState("");
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
                setSecondTextFieldValue(newValue || "");
            } else {
                setErrorMsg("");
                setSecondTextFieldValue(newValue);
            }
        },
        []
    );

    /*
     * This function takes in user input on whether they want to include a hyperlink or not and,
     * based on that, fills in the URL text field value with the user's input
     */
    function theString(param: string | undefined): string {
        if (param == "url" && errorMsg == "") {
            return secondTextFieldValue;
        } else {
            return "";
        }
    }

    /*
     * This function returns true if the user wants to include a hyperlink and false if not.
     */
    function CheckURL(param: string | undefined): boolean {
        if (param == "url") {
            return false;
        } else {
            return true;
        }
    }

    /*
     * This function fills in the URL textbox if the user wants a hyperlink and empties it if not.
     */
    function standard(param: string): string {
        if (CheckURL(urlKey) == false) {
            return param;
        } else {
            return "";
        }
    }

    // Part 2 - Icon

    const [query, setQuery] = React.useState("Add");

    const emojiIcon: IIconProps = { iconName: query }; // "Emoji2"

    const [disabledIconKey, setDisabledIconKey] = React.useState<
        string | undefined
    >("nondisabled");

    /* const [disabledFocusIconKey, setDisabledFocusIconKey] = React.useState<
        string | undefined
    >("focus"); */

    const [checkedIconKey, setCheckedIconKey] = React.useState<
        string | undefined
    >("unchecked");

    const [iconUrlKey, setIconUrlKey] = React.useState<string | undefined>(
        "nourl"
    );

    const [firstTextFieldValue, setFirstTextFieldValue] = React.useState("");

    const [iconErrorMsg, setIconErrorMsg] = React.useState("");

    const onChangeIconUrlLink = React.useCallback(
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
                setIconErrorMsg(
                    "Error: Invalid URL (must begin with HTTP or /)"
                );
                setFirstTextFieldValue(newValue || "");
            } else {
                setIconErrorMsg("");
                setFirstTextFieldValue(newValue);
            }
        },
        []
    );

    function mynext(param: string): string {
        if (CheckURL(iconUrlKey) == false) {
            return param;
        } else {
            return "";
        }
    }

    function dup(param: string | undefined): string {
        if (param == "url" && errorMsg == "") {
            return firstTextFieldValue;
        } else {
            return "";
        }
    }

    //Part 3 - testing stuff

    const [result, setResult] = React.useState<Item[] | undefined>();

    const mainfinal = React.useCallback(
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

    /*
     * When a user clicks on any of the items in the icon name dropdown, this function
     * automatically populates the textfield with the name of that item.
     */
    function Foo(param: string): void {
        setQuery(param);

        const foundItem = ICONS.filter((item) =>
            item.name.toLowerCase().includes(param.toLowerCase())
        );
        setResult(foundItem);
    }

    //Padding Sliders - Normal Button

    const [paddingSliderValue, setPaddingSliderValue] = React.useState(15);
    const paddingSliderOnChange = (value: number) => {
        setPaddingSliderValue(value);
        setPaddingSliderLeftValue(value);
        setPaddingSliderRightValue(value);
        setPaddingSliderTopValue(value);
        setPaddingSliderBottomValue(value);
    };

    const [paddingSliderLeftValue, setPaddingSliderLeftValue] = React.useState(
        15
    );
    const paddingSliderLeftOnChange = (value: number) =>
        setPaddingSliderLeftValue(value);

    const [
        paddingSliderRightValue,
        setPaddingSliderRightValue,
    ] = React.useState(15);
    const paddingSliderRightOnChange = (value: number) =>
        setPaddingSliderRightValue(value);

    const [paddingSliderTopValue, setPaddingSliderTopValue] = React.useState(
        15
    );
    const paddingSliderTopOnChange = (value: number) =>
        setPaddingSliderTopValue(value);

    // Margin Sliders - Normal Button

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

    const [marginSliderRightValue, setMarginSliderRightValue] = React.useState(
        0
    );
    const marginSliderRightOnChange = (value: number) =>
        setMarginSliderRightValue(value);

    const [marginSliderTopValue, setMarginSliderTopValue] = React.useState(0);
    const marginSliderTopOnChange = (value: number) =>
        setMarginSliderTopValue(value);

    const [
        marginSliderBottomValue,
        setMarginSliderBottomValue,
    ] = React.useState(0);
    const marginSliderBottomOnChange = (value: number) =>
        setMarginSliderBottomValue(value);

    //Font Size - Normal Button
    const [fontValue, setFontValue] = React.useState(12);
    const fontOnChange = (value: number) => setFontValue(value);

    const [
        paddingSliderBottomValue,
        setPaddingSliderBottomValue,
    ] = React.useState(15);

    const paddingSliderBottomOnChange = (value: number) =>
        setPaddingSliderBottomValue(value);

    /*
    Styles the normal button based on the padding, margin, and font size parameters set directly above
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

    // Alignment options for normal button (left, right, or center)
    const alignOptions: IChoiceGroupOption[] = [
        { key: "flex-start", text: "Left" },
        { key: "center", text: "Middle" },
        { key: "flex-end", text: "Right" },
    ];

    const [alignKey, setAlignKey] = React.useState<string | undefined>(
        "center"
    );

    const [iconAlignKey, setIconAlignKey] = React.useState<string | undefined>(
        "center"
    );

    //Padding Sliders - Icon Button

    const [iconPaddingSliderValue, setIconPaddingSliderValue] = React.useState(
        15
    );
    const iconPaddingSliderOnChange = (value: number) => {
        setIconPaddingSliderValue(value);
        setIconPaddingSliderLeftValue(value);
        setIconPaddingSliderRightValue(value);
        setIconPaddingSliderTopValue(value);
        setIconPaddingSliderBottomValue(value);
    };

    const [
        iconPaddingSliderLeftValue,
        setIconPaddingSliderLeftValue,
    ] = React.useState(15);
    const iconPaddingSliderLeftOnChange = (value: number) =>
        setIconPaddingSliderLeftValue(value);

    const [
        iconPaddingSliderRightValue,
        setIconPaddingSliderRightValue,
    ] = React.useState(15);
    const iconPaddingSliderRightOnChange = (value: number) =>
        setIconPaddingSliderRightValue(value);

    const [
        iconPaddingSliderTopValue,
        setIconPaddingSliderTopValue,
    ] = React.useState(15);
    const iconPaddingSliderTopOnChange = (value: number) =>
        setIconPaddingSliderTopValue(value);

    // Margin Sliders - Icon Button

    const [iconMarginSliderValue, setIconMarginSliderValue] = React.useState(0);
    const iconMarginSliderOnChange = (value: number) => {
        setIconMarginSliderValue(value);
        setIconMarginSliderLeftValue(value);
        setIconMarginSliderRightValue(value);
        setIconMarginSliderTopValue(value);
        setIconMarginSliderBottomValue(value);
    };

    const [
        iconMarginSliderLeftValue,
        setIconMarginSliderLeftValue,
    ] = React.useState(0);
    const iconMarginSliderLeftOnChange = (value: number) =>
        setIconMarginSliderLeftValue(value);

    const [
        iconMarginSliderRightValue,
        setIconMarginSliderRightValue,
    ] = React.useState(0);
    const iconMarginSliderRightOnChange = (value: number) =>
        setIconMarginSliderRightValue(value);

    const [
        iconMarginSliderTopValue,
        setIconMarginSliderTopValue,
    ] = React.useState(0);
    const iconMarginSliderTopOnChange = (value: number) =>
        setIconMarginSliderTopValue(value);

    const [
        iconMarginSliderBottomValue,
        setIconMarginSliderBottomValue,
    ] = React.useState(0);
    const iconMarginSliderBottomOnChange = (value: number) =>
        setIconMarginSliderBottomValue(value);

    const [
        iconPaddingSliderBottomValue,
        setIconPaddingSliderBottomValue,
    ] = React.useState(15);

    const iconPaddingSliderBottomOnChange = (value: number) =>
        setIconPaddingSliderBottomValue(value);

    /*
    Styles the icon button based on the padding and margin parameters set directly above
    */
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

    /*
     * Determines width and height of the user's window (and updates dynamically every time they resize it)
     */
    const [width, setWidth] = React.useState(window.innerWidth);
    const [height, setHeight] = React.useState(window.innerHeight);

    const updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    React.useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    //Styles for the setting columns
    const stackTokens = { childrenGap: width / 30 }; //gap between the columns - 30

    //Styles specifically for normal button columns
    const stackStyles: Partial<IStackStyles> = {
        root: {
            width: width / 1.2,
            height: height / 2.8,
            display: "flex",
            justifyContent: "center",
            overflow: "scroll",
        }, //width of the actual columns
    };

    const columnProps: Partial<IStackProps> = {
        tokens: { childrenGap: 55 },
        styles: {
            root: {
                width: width,
                //overflowX: "scroll",
                // overflowY: "scroll",
            },
        },
    };

    //Styles specifically for icon button columns
    const iconStackStyles: Partial<IStackStyles> = {
        root: {
            width: width / 1.2, //width / 1.2
            height: height / 2.1,
            display: "flex",
            justifyContent: "center",
            overflow: "scroll",
        }, //width of the actual columns
    };

    return (
        <>
            <h1 style={headingStyle}> Normal Button</h1>
            {/* Normal Button component */}
            <div style={{ display: "flex", justifyContent: alignKey }}>
                <DefaultButton
                    id="btn"
                    name="btn"
                    primary={selectedKey == "primary"} //done
                    text={labelValue} //done
                    allowDisabledFocus={true}
                    disabled={disabledKey == "disabled"}
                    checked={checkedKey == "checked"}
                    ariaDescription="hello"
                    ariaLabel="hello"
                    href={theString(urlKey)} //href="https://www.google.com/"
                    target="_blank"
                    split={true}
                    style={newStyle}
                />
            </div>
            <br></br>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                    <Stack {...columnProps}>
                        {/* Textfield for assigning text label to button */}
                        <TextField
                            label="Text"
                            defaultValue={labelValue}
                            onChange={TextFieldOnChange(setLabelValue)}
                        />
                        <ChoiceGroup
                            selectedKey={alignKey}
                            options={alignOptions}
                            onChange={ChoiceGroupOnChange(setAlignKey)}
                            label="Align status"
                        />
                        {/* ChoiceGroup for assigning style (primary/default) to button */}
                        <ChoiceGroup
                            selectedKey={selectedKey}
                            options={styleOptions}
                            onChange={ChoiceGroupOnChange(setSelectedKey)}
                            label="Choose a style"
                        />
                        <ChoiceGroup
                            selectedKey={disabledKey}
                            options={disabledOptions}
                            onChange={ChoiceGroupOnChange(setDisabledKey)}
                            label="Disabled status"
                        />
                    </Stack>
                    <Stack {...columnProps}>
                        {/* <ChoiceGroup
                            selectedKey={disabledFocusKey}
                            options={allowDisabledFocusOptions}
                            onChange={ChoiceGroupOnChange(setDisabledFocusKey)}
                            label="Focus in disabled mode"
                        /> */}
                        <Slider
                            label="Font Size"
                            min={0}
                            max={100}
                            defaultValue={50}
                            value={fontValue}
                            onChange={fontOnChange}
                        />
                        <ChoiceGroup
                            selectedKey={checkedKey}
                            options={checkedOptions}
                            onChange={ChoiceGroupOnChange(setCheckedKey)}
                            label="Checked status"
                        />
                        <ChoiceGroup
                            selectedKey={urlKey}
                            options={urlOptions}
                            onChange={ChoiceGroupOnChange(setUrlKey)}
                            label="Would you like to include a hyperlink?"
                        />
                        <TextField
                            label="URL"
                            value={standard(secondTextFieldValue)}
                            onChange={onChangeSecondTextFieldValue}
                            errorMessage={standard(errorMsg)}
                            disabled={CheckURL(urlKey)}
                        />
                    </Stack>
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
                </Stack>
            </div>
            <h2 style={headingStyle}> JSON Editor for Normal Button</h2>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: height / 3, //500
                }}
            >
                <MonacoEditor
                    language="json"
                    containerStyle={{
                        // display: "flex",
                        //flexDirection: "column",
                        //flexGrow: 1,
                        width: "80%",
                        height: "100%",
                        // justifyContent: "center",
                    }}
                    editorOptions={{
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
            {/* <Slider
                label="Font Size"
                min={0}
                max={100}
                defaultValue={50}
                value={fontValue}
                onChange={fontOnChange}
            /> */}
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 5,
                }}
            />

            <h1 style={headingStyle}> Icon Button</h1>
            <div style={{ display: "flex", justifyContent: iconAlignKey }}>
                <IconButton
                    //menuProps={menuProps}
                    iconProps={emojiIcon}
                    //title="sdwerer"
                    ariaLabel="Emoji"
                    allowDisabledFocus={true}
                    disabled={disabledIconKey == "disabled"}
                    checked={checkedIconKey == "checked"}
                    href={dup(iconUrlKey)} //{secondTextFieldValue ? urlKey == "url" : ""}
                    target="_blank"
                    split={true}
                    size={50}
                    style={iconStyle}
                />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Stack horizontal tokens={stackTokens} styles={iconStackStyles}>
                    <Stack {...columnProps}>
                        <TextField
                            label="Enter an icon name [example: Delete]"
                            defaultValue="hello"
                            value={query}
                            onChange={mainfinal}
                            //errorMessage={"Error: not a valid icon"}
                        />

                        {/* Display search result */}

                        <div className="search-result">
                            {result && result.length > 0 ? (
                                result.map((item) => (
                                    <li key={item.id} className="item">
                                        {/*   <span style={headingStyle}>{item.id}</span> */}

                                        <DefaultButton
                                            onClick={() => Foo(item.name)}
                                            text={item.name}
                                        />
                                    </li>
                                ))
                            ) : (
                                <h2>No items found!</h2>
                            )}
                        </div>
                    </Stack>
                    <Stack {...columnProps}>
                        <ChoiceGroup
                            selectedKey={iconAlignKey}
                            options={alignOptions}
                            onChange={ChoiceGroupOnChange(setIconAlignKey)}
                            label="Align status for icon"
                        />
                        <ChoiceGroup
                            selectedKey={disabledIconKey}
                            options={disabledOptions}
                            onChange={ChoiceGroupOnChange(setDisabledIconKey)}
                            label="Disabled status for icon"
                        />
                        {/* <ChoiceGroup
                            selectedKey={disabledFocusIconKey}
                            options={allowDisabledFocusOptions}
                            onChange={ChoiceGroupOnChange(
                                setDisabledFocusIconKey
                            )}
                            label="Focus in disabled mode"
                            /> */}
                        <ChoiceGroup
                            selectedKey={checkedIconKey}
                            options={checkedOptions}
                            onChange={ChoiceGroupOnChange(setCheckedIconKey)}
                            label="Checked status for icon"
                        />
                        <ChoiceGroup
                            selectedKey={iconUrlKey}
                            options={urlOptions}
                            onChange={ChoiceGroupOnChange(setIconUrlKey)}
                            label="Would you like to include a hyperlink for the icon?"
                        />
                        <TextField
                            label="URL"
                            value={mynext(firstTextFieldValue)}
                            onChange={onChangeIconUrlLink}
                            errorMessage={mynext(iconErrorMsg)}
                            disabled={CheckURL(iconUrlKey)}
                        />
                    </Stack>
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
                </Stack>
            </div>
            <h2 style={headingStyle}> JSON Editor for Icon Button</h2>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: height / 3, //500
                }}
            >
                <MonacoEditor
                    language="json"
                    containerStyle={{
                        // display: "flex",
                        //flexDirection: "column",
                        //flexGrow: 1,
                        width: "80%",
                        height: "100%",
                        // justifyContent: "center",
                    }}
                    editorOptions={{
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
            {/* <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 1,
                }}
            /> */}
        </>
    );
};
