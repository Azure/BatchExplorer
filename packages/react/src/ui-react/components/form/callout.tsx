import { mergeStyleSets } from "@fluentui/react/lib/";
import { Callout as FluentCallout } from "@fluentui/react/lib/Callout";
import { Text } from "@fluentui/react/lib/Text";
import * as React from "react";
import { FormControlProps } from "./form-control";

/**
 * A callout is a popup that appears when an item (usually link or button) is pressed.
 * For more information, see: https://developer.microsoft.com/en-us/fluentui#/controls/web/callout
 */

export interface CalloutProps<V> extends FormControlProps<V> {
    /**
     * The target that the Callout should try to position itself based on.
     */
    target?: string;

    /**
     * The UI elements contained within the callout.
     */
    children?: React.ReactNode;

    /**
     * Callback when the Callout tries to close.
     */
    onDismiss?: (
        ev?:
            | Event
            | React.MouseEvent<HTMLElement, MouseEvent>
            | React.KeyboardEvent<HTMLElement>
    ) => void;

    /**
     * When set to true, the callout is shown. Otherwise, it is hidden.
     */
    isCalloutVisible?: boolean;

    /**
     * Text of the callout heading/title.
     */
    heading?: string;

    /**
     * Font size of the callout heading/title.
     */
    headingFontSize?: "small" | "medium" | "large" | "xLarge";

    /**
     * Text of the callout body.
     */
    body?: string;

    /**
     * Font size of the callout body.
     */
    bodyFontSize?: "small" | "medium" | "large" | "xLarge";

    /**
     * If true, then the callout will attempt to focus the first focusable element that it contains. If it doesn't find a focusable element, no focus will be set.
     */
    setInitialFocus?: boolean;

    /**
     * The gap between the Callout and the target, specified as number of pixels.
     */
    gapSpace?: number;
}

export function Callout<V>(props: CalloutProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    return (
        <>
            {props.isCalloutVisible && (
                <FluentCallout
                    setInitialFocus={props.setInitialFocus}
                    target={props.target}
                    className={styles.callout}
                    style={props.style}
                    onDismiss={props.onDismiss}
                    gapSpace={props.gapSpace}
                >
                    <Text
                        block
                        variant={props.headingFontSize}
                        className={styles.title}
                    >
                        {props.heading}
                    </Text>
                    <Text block variant={props.bodyFontSize}>
                        {props.body}
                    </Text>
                    {props.children}
                </FluentCallout>
            )}
        </>
    );
}

const styles = mergeStyleSets({
    callout: {
        width: 320,
        maxWidth: "90%",
        padding: "20px 24px",
    },
    title: {
        marginBottom: 12,
    },
});
