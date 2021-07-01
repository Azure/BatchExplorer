import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { SearchBox, ISearchBoxStyles } from "@fluentui/react/lib/SearchBox";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { Toggle } from "@fluentui/react/lib/index";
import { TextField } from "@fluentui/react/lib/TextField";
import { ChoiceGroupOnChange, TextFieldOnChange } from "../../../functions";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { Icon } from "@fluentui/react/lib/Icon";
import {
    Stack,
    IStackProps,
    IStackStyles,
    IStackTokens,
} from "@fluentui/react/lib/Stack";
import { HeightAndWidth } from "../../../functions";
import { IButtonStyles, IconButton } from "@fluentui/react/lib/Button";

export const SearchBoxDemo: React.FC = (props) => {
    const searchBoxStyles: Partial<ISearchBoxStyles> = {
        root: {
            width: 400,
        },
        /* field: {
            color: "#000000",
        }, */
    };

    const [disableAnimationKey, setDisableAnimationKey] = React.useState(false);

    const onDisabledAnimationChange = React.useCallback(
        (ev, checked?: boolean) => setDisableAnimationKey(!!checked),
        []
    );

    const [placeHolderValue, setPlaceHolderValue] =
        React.useState("Sample placeholder");

    const [underlineKey, setUnderlineKey] = React.useState(false);

    const onUnderlineChange = React.useCallback(
        (ev, checked?: boolean) => setUnderlineKey(!!checked),
        []
    );

    const [disabledKey, setDisabledKey] = React.useState(false);

    const onDisabledChange = React.useCallback(
        (ev, checked?: boolean) => setDisabledKey(!!checked),
        []
    );

    const [filterIconKey, setFilterIconKey] = React.useState<
        string | undefined
    >("Search");

    const filterIconOptions: IChoiceGroupOption[] = [
        { key: "", text: "None" },
        { key: "Search", text: "Search" },
        { key: "Filter", text: "Filter" },
    ];

    const filterIcon: IIconProps = { iconName: filterIconKey }; //Search or Filter - choiceGroup
    //const labelId = "labelElement";

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

    const buttonStyles: Partial<IButtonStyles> = {
        root: {
            backgroundColor: "#d9d9d9",
            color: "#0066ff",
        },
    };

    return (
        <DemoPane title="SearchBox">
            <div style={{ display: "flex", justifyContent: "center" }}>
                <SearchBox
                    styles={searchBoxStyles}
                    ariaLabel="Searchbox that can be customized as needed"
                    placeholder={placeHolderValue}
                    disableAnimation={disableAnimationKey}
                    //onSearch={(newValue) => console.log("value is " + newValue)}
                    underlined={underlineKey}
                    disabled={disabledKey}
                    iconProps={filterIcon}
                />
                <IconButton
                    iconProps={{ iconName: "Filter" }}
                    title="Filter"
                    ariaLabel="Filter"
                    styles={buttonStyles}
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
                                    label="Placeholder"
                                    defaultValue={placeHolderValue}
                                    onChange={TextFieldOnChange(
                                        setPlaceHolderValue
                                    )}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Disable the Animation Key{" "}
                                            <TooltipHost content="Whether or not to animate the SearchBox icon on focus.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onDisabledAnimationChange}
                                    checked={disableAnimationKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Underlined{" "}
                                            <TooltipHost content="Whether or not the SearchBox is underlined.">
                                                <Icon
                                                    iconName="Info"
                                                    aria-label="Info tooltip"
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    inlineLabel
                                    onChange={onUnderlineChange}
                                    checked={underlineKey}
                                />
                                <Toggle
                                    label={
                                        <div>
                                            Disabled{" "}
                                            <TooltipHost content="Disabled state of the searchbox.">
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

                                <ChoiceGroup
                                    selectedKey={filterIconKey}
                                    options={filterIconOptions}
                                    onChange={ChoiceGroupOnChange(
                                        setFilterIconKey
                                    )}
                                    label="Icon Type"
                                />
                            </Stack>
                        </span>
                    </Stack>
                </Stack>
            </div>
        </DemoPane>
    );
};
