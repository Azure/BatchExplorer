import { IStackTokens, Stack as FluentStack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { FormControlProps } from "./form-control";

export interface StackProps<V> extends FormControlProps<V> {
    /**
     * The UI elements that are contained within the stack.
     */
    children?: React.ReactNode;

    /**
     * Defines whether to render Stack children horizontally.
     */
    horizontal?: boolean;

    /**
     * Defines the spacing between Stack children.
     */
    childrenGap?: string | number;

    /**
     * ID that identifies the Stack.
     */
    id?: string;
}

export function Stack<V>(props: StackProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    const containerStackTokens: IStackTokens = {
        childrenGap: props.childrenGap,
    };

    return (
        <>
            <FluentStack
                id={props.id}
                tokens={containerStackTokens}
                horizontal={props.horizontal}
                style={props.style}
            >
                {props.children}
            </FluentStack>
        </>
    );
}
