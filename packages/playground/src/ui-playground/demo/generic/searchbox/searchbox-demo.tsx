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

export const SearchBoxDemo: React.FC = (props) => {
    const searchBoxStyles: Partial<ISearchBoxStyles> = {
        root: {
            width: 200,
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

    return (
        <DemoPane title="SearchBox">
            <SearchBox
                styles={searchBoxStyles}
                ariaLabel="Searchbox that can be customized as needed"
                placeholder={placeHolderValue}
                disableAnimation={disableAnimationKey}
                onSearch={(newValue) => console.log("value is " + newValue)}
                underlined={underlineKey}
                disabled={disabledKey}
                iconProps={filterIcon}
            />
            <TextField
                label="Placeholder Value"
                defaultValue={placeHolderValue}
                onChange={TextFieldOnChange(setPlaceHolderValue)}
            />
            <Toggle
                label="Disable the Animation Key? True or False"
                inlineLabel
                onChange={onDisabledAnimationChange}
                checked={disableAnimationKey}
            />
            <Toggle
                label="Underlined? True or False"
                inlineLabel
                onChange={onUnderlineChange}
                checked={underlineKey}
            />
            <Toggle
                label="Disabled? True or False"
                inlineLabel
                onChange={onDisabledChange}
                checked={disabledKey}
            />
            <ChoiceGroup
                selectedKey={filterIconKey}
                options={filterIconOptions}
                onChange={ChoiceGroupOnChange(setFilterIconKey)}
                label="Filter icon"
            />
        </DemoPane>
    );
};
