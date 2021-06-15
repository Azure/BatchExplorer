import React from "react";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { TextField } from "@fluentui/react/lib/TextField";
import { headingStyle } from "../style";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { TextFieldOnChange, ChoiceGroupOnChange } from "../functions";
import { IIconProps } from "@fluentui/react/lib/";
import { IconButton } from "@fluentui/react/lib/Button";
//import { Icon } from "@fluentui/react/lib/Icon";
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

export const Button = () => {
    const [labelValue, setLabelValue] = React.useState("");
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(
        "primary"
    );

    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    const [disabledFocusKey, setDisabledFocusKey] = React.useState<
        string | undefined
    >("focus");

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

    const allowDisabledFocusOptions: IChoiceGroupOption[] = [
        { key: "focus", text: "Focus" },
        { key: "nofocus", text: "No focus" },
    ];

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
            /* if (!newValue || newValue.length <= 5) {
                setErrorMsg("Hello");
                setSecondTextFieldValue(newValue || "");
            }
            */

            let count = 0;
            //let dummy = 5;
            const ch = ".";

            let i = 0;
            if (!newValue) {
                //dummy++;
            } else {
                i = newValue.length - 1;
            }
            // let i = newValue.length - 1;

            while (i >= 0) {
                if (newValue?.charAt(i) == ch) {
                    count++;
                }
                i--;
            }

            if (
                !newValue ||
                newValue[0] != "h" ||
                newValue[1] != "t" ||
                newValue[2] != "t" ||
                newValue[3] != "p" ||
                !newValue.includes(".") ||
                (newValue.indexOf(":") != 4 && newValue.indexOf(":") != 5) ||
                (newValue[4] != "s" && newValue[4] != ":") ||
                count < 2 ||
                newValue.lastIndexOf(".") == newValue.length - 1
            ) {
                setErrorMsg("Error: Invalid URL (must begin with HTTP)");
                setSecondTextFieldValue(newValue || "");
            } else {
                setErrorMsg("");
                setSecondTextFieldValue(newValue);
            }
        },
        []
    );

    function theString(param: string | undefined): string {
        if (param == "url" && errorMsg == "") {
            return secondTextFieldValue;
        } else {
            return "";
        }
    }

    function CheckURL(param: string | undefined): boolean {
        if (param == "url") {
            return false;
        } else {
            return true;
        }
    }

    function standard(param: string): string {
        if (CheckURL(urlKey) == false) {
            return param;
        } else {
            return "";
        }
    }

    // Part 2 - Icon

    //const [iconValue, setIconValue] = React.useState("");

    const [query, setQuery] = React.useState("");

    const emojiIcon: IIconProps = { iconName: query }; // "Emoji2"

    //const MyIcon = () => <Icon iconName="CompassNW" />;

    const [disabledIconKey, setDisabledIconKey] = React.useState<
        string | undefined
    >("nondisabled");

    const [disabledFocusIconKey, setDisabledFocusIconKey] = React.useState<
        string | undefined
    >("focus");

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
            /* if (!newValue || newValue.length <= 5) {
                setErrorMsg("Hello");
                setSecondTextFieldValue(newValue || "");
            }
            */

            let count = 0;
            //let dummy = 5;
            const ch = ".";

            let i = 0;
            if (!newValue) {
                //dummy++;
            } else {
                i = newValue.length - 1;
            }
            // let i = newValue.length - 1;

            while (i >= 0) {
                if (newValue?.charAt(i) == ch) {
                    count++;
                }
                i--;
            }

            if (
                !newValue ||
                newValue[0] != "h" ||
                newValue[1] != "t" ||
                newValue[2] != "t" ||
                newValue[3] != "p" ||
                !newValue.includes(".") ||
                (newValue.indexOf(":") != 4 && newValue.indexOf(":") != 5) ||
                (newValue[4] != "s" && newValue[4] != ":") ||
                count < 2 ||
                newValue.lastIndexOf(".") == newValue.length - 1
            ) {
                setIconErrorMsg("Error: Invalid URL (must begin with HTTP)");
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

    // Create an interface for product item
    interface Item {
        id: number;
        name: string;
        price: number;
    }

    // This list holds some products of a fiction store
    const PRODUCTS: Item[] = [
        {
            id: 1,
            name: "Add",
            price: 1,
        },
        {
            id: 2,
            name: "Delete",
            price: 1,
        },
        {
            id: 3,
            name: "Refresh",
            price: 1,
        },
        {
            id: 4,
            name: "SingleColumnEdit",
            price: 5,
        },
        {
            id: 5,
            name: "Room",
            price: 0.5,
        },
        {
            id: 6,
            name: "ShopServer",
            price: 200,
        },
    ];

    const [result, setResult] = React.useState<Item[] | undefined>();

    // This function is called when the input changes

    /*  const inputHandler = React.useCallback(
        (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
        ) => {
            const enteredName = (event.target as HTMLTextAreaElement).value;
            setQuery(enteredName);
        },
        []
    );

    // This function is triggered when the Search buttion is clicked
    const search = () => {
        const foundItems = PRODUCTS.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        setResult(foundItems);
    }; */

    const mainfinal = React.useCallback(
        (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
        ) => {
            const enteredName = (event.target as HTMLTextAreaElement).value;
            setQuery(enteredName);

            const foundItems = PRODUCTS.filter((item) =>
                item.name.toLowerCase().includes(enteredName.toLowerCase())
            );
            setResult(foundItems);
        },
        []
    );

    /*  function thetest(): void {
        setQuery(item.name)
    } */

    //End of testing stuff
    //const milky = "   ,   ";

    function Foo(param: string): void {
        // ...
        // const Hello = React.useCallback(() => {
        setQuery(param);
        //};

        // return Hello;
    }

    /*   const handleToggle = (
        param: string | undefined,
        second: (value: React.SetStateAction<string>) => void
    ) => {
        if (param) {
            second(param);
        }
    };*/

    return (
        <>
            <h1 style={headingStyle}> Normal Button</h1>
            {/* Actual component */}
            <DefaultButton
                id="btn"
                name="btn"
                primary={selectedKey == "primary"} //done
                text={labelValue} //done
                allowDisabledFocus={disabledFocusKey == "focus"}
                disabled={disabledKey == "disabled"}
                checked={checkedKey == "checked"}
                ariaDescription="hello"
                ariaLabel="hello"
                href={theString(urlKey)} //href="https://www.google.com/" //{secondTextFieldValue ? urlKey == "url" : ""}
                target="_blank"
                split={true}
            />
            {/* Textfield for assigning text label to button */}
            <TextField
                label="Text"
                defaultValue={labelValue}
                onChange={TextFieldOnChange(setLabelValue)}
            />
            {/* ChoiceGroup for assigning style (primary/default) to button */}
            <ChoiceGroup
                selectedKey={selectedKey}
                options={styleOptions}
                onChange={ChoiceGroupOnChange(setSelectedKey)}
                label="Choose a style"
            />
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 5,
                }}
            />
            <h2>Disabled</h2>
            <ChoiceGroup
                selectedKey={disabledKey}
                options={disabledOptions}
                onChange={ChoiceGroupOnChange(setDisabledKey)}
                label="Disabled status"
            />
            <ChoiceGroup
                selectedKey={disabledFocusKey}
                options={allowDisabledFocusOptions}
                onChange={ChoiceGroupOnChange(setDisabledFocusKey)}
                label="Focus in disabled mode"
            />
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 5,
                }}
            />
            <ChoiceGroup
                selectedKey={checkedKey}
                options={checkedOptions}
                onChange={ChoiceGroupOnChange(setCheckedKey)}
                label="Checked status"
            />
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 5,
                }}
            />
            <h2>Hyperlink</h2>
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
            <hr
                style={{
                    color: "red",
                    backgroundColor: "red",
                    height: 5,
                }}
            />
            <h1 style={headingStyle}> Icon Button</h1>
            <IconButton
                //menuProps={menuProps}
                iconProps={emojiIcon}
                //title="sdwerer"
                ariaLabel="Emoji"
                allowDisabledFocus={disabledFocusIconKey == "focus"}
                disabled={disabledIconKey == "disabled"}
                checked={checkedIconKey == "checked"}
                href={dup(iconUrlKey)} //{secondTextFieldValue ? urlKey == "url" : ""}
                target="_blank"
                split={true}
                size={50}
            />
            {/* <TextField
                label="Enter an icon name [example: Emoji]"
                defaultValue="hello"
                value={iconValue}
                onChange={TextFieldOnChange(setIconValue)}
                //errorMessage={"Error: not a valid icon"}
            /> */}
            <TextField
                label="Enter an icon name [example: Emoji]"
                defaultValue="hello"
                value={query}
                onChange={mainfinal}
                //errorMessage={"Error: not a valid icon"}
            />
            {/* <DefaultButton onClick={search} text={"Search"} /> */}

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
                            {/* item.price *}
                            {/* <span style={iconDropdownStyle}>
                                Name: {item.name} {milky}
                            </span>
                            <span style={iconDropdownStyle}>
                                Unicode: {item.price}
                    </span> */}
                        </li>
                    ))
                ) : (
                    <h2>No items found!</h2>
                )}
            </div>
            <ChoiceGroup
                selectedKey={disabledIconKey}
                options={disabledOptions}
                onChange={ChoiceGroupOnChange(setDisabledIconKey)}
                label="Disabled status for icon"
            />
            <ChoiceGroup
                selectedKey={disabledFocusIconKey}
                options={allowDisabledFocusOptions}
                onChange={ChoiceGroupOnChange(setDisabledFocusIconKey)}
                label="Focus in disabled mode"
            />
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
            {/* <TextField
                label="TESTING APPLE"
                defaultValue="hello"
                value={query}
                onChange={inputHandler}
                //errorMessage={"Error: not a valid icon"}
            /> */}
            {/* <button onClick={search}>Search</button> */}
        </>
    );
};
