import { Link as FluentLink } from "@fluentui/react/lib/Link";
import * as React from "react";
import { FormControlProps } from "./form-control";

export interface LinkProps<V> extends FormControlProps<V> {
    underline?: boolean;
    href?: string;
    text?: string;
    onClick?: (
        event: React.MouseEvent<
            HTMLAnchorElement | HTMLElement | HTMLButtonElement,
            MouseEvent
        >
    ) => void;
}

export function Link<V>(props: LinkProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    return (
        <FluentLink
            id={props.id}
            disabled={props.disabled}
            underline={props.underline}
            href={props.href}
            onClick={props.onClick}
        >
            {props.text}
        </FluentLink>
    );
}
