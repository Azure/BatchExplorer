import { IconButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { copyToClipboard } from "@batch/ui-common";

export interface PropertyFieldProps<T> {
    label?: string;
    value?: T;
    getText?: (value?: T) => string;
    renderLabel?: (label?: string) => React.ReactNode;
    renderValue?: (value?: T) => React.ReactNode;
}

function defaultGetText(value: unknown): string {
    return value ? String(value) : "";
}

function mouseOutHandler(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    const btn = event.currentTarget.getElementsByClassName(
        "clipboard-button"
    )[0] as HTMLElement;
    btn.style.visibility = "hidden";
}

/**
 * Displays a single key/value pair with an icon to copy the value to
 * the clipboard
 */
export function PropertyField<T>(props: PropertyFieldProps<T>): JSX.Element {
    const getText = props.getText ?? defaultGetText;

    const defaultRenderValue: (value?: T) => React.ReactNode =
        React.useCallback(
            (val) => {
                const text = getText && getText(val);
                return text !== "" ? text : "-";
            },
            [getText]
        );
    const renderValue = props.renderValue ?? defaultRenderValue;

    const mouseOverHandler: (
        event: React.MouseEvent<HTMLElement, MouseEvent>
    ) => void = React.useCallback(
        (event) => {
            const btn = event.currentTarget.getElementsByClassName(
                "clipboard-button"
            )[0] as HTMLElement;
            if (getText(props.value) !== "") {
                // Only show clipboard icon if the value is defined and not
                // empty string
                btn.style.visibility = "visible";
            }
        },
        [getText, props.value]
    );

    const clipboardClickHandler = React.useCallback(() => {
        copyToClipboard(getText(props.value));
    }, [getText, props.value]);

    return (
        <>
            <Stack
                tokens={{ childrenGap: 8 }}
                horizontal
                style={{
                    display: "flex",
                    maxWidth: "1200px",
                    minWidth: "600px",
                }}
                onMouseOver={mouseOverHandler}
                onMouseOut={mouseOutHandler}
            >
                <div
                    data-testid="label"
                    className="property-label"
                    style={{
                        flexBasis: "160px",
                        flexShrink: 0,
                        height: "24px",
                        lineHeight: "24px",
                    }}
                >
                    {props.renderLabel && props.renderLabel(props.label)}
                </div>
                <div
                    style={{
                        flexShrink: 0,
                        flexGrow: 1,
                        flexBasis: 0,
                    }}
                >
                    <div
                        style={{
                            display: "inline-block",
                            wordBreak: "break-word",
                            height: "24px",
                            lineHeight: "24px",
                        }}
                    >
                        <span
                            data-testid="content"
                            className="property-content"
                        >
                            {renderValue(props.value)}
                        </span>
                        <div
                            className="clipboard-button"
                            style={{
                                display: "inline-block",
                                height: "24px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                visibility: "hidden",
                            }}
                        >
                            <IconButton
                                // Line height is 24px, icon height is 32px. Need
                                // to move the icon up 4px to align center with text
                                style={{ marginTop: "-4px" }}
                                iconProps={{ iconName: "copy" }}
                                onClick={clipboardClickHandler}
                            />
                        </div>
                    </div>
                </div>
            </Stack>
        </>
    );
}
PropertyField.defaultProps = {
    getText: (value: unknown) => (value ? String(value) : ""),
    renderLabel: (label: string) => (label ? label : "-"),
};
