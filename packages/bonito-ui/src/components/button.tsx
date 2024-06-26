import * as React from "react";
import {
    BaseButton,
    DefaultButton as FluentButton,
} from "@fluentui/react/lib/Button";

type FluentOnClickElement =
    | HTMLAnchorElement
    | HTMLButtonElement
    | HTMLDivElement
    | BaseButton
    | FluentButton
    | HTMLSpanElement;

export interface ButtonProps {
    disabled?: boolean;
    label?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    primary?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
    const { disabled, label, onClick, primary } = props;

    const clickHandler: React.MouseEventHandler<FluentOnClickElement> =
        React.useCallback(
            (event: React.MouseEvent<FluentOnClickElement>) => {
                if (onClick) {
                    // Cast to Element here to avoid making Fluent's odd
                    // event handler type external to this component
                    onClick(event as React.MouseEvent<HTMLElement>);
                }
            },
            [onClick]
        );

    return (
        <FluentButton
            primary={primary}
            disabled={disabled}
            text={label}
            onClick={clickHandler}
        />
    );
};
