import {
    BaseButton,
    Button as FluentButton,
    DefaultButton,
    PrimaryButton,
} from "@fluentui/react/lib/Button";
import * as React from "react";

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
    id?: string;
}

export const Button: React.FC<ButtonProps> = (props) => {
    const { disabled, label, onClick, primary, id } = props;

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

    const FluentButton = primary ? PrimaryButton : DefaultButton;
    return (
        <FluentButton
            disabled={disabled}
            text={label}
            onClick={clickHandler}
            id={id}
        />
    );
};
