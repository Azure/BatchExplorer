import React from "react";
import { useAppTheme } from "../theme";
import { Button, ButtonProps } from "./button";

export interface PaneFooterProps {
    buttons?: ButtonProps[];
    children?: React.ReactNode;
}

export const PaneFooter = (props: PaneFooterProps) => {
    const { children, buttons } = props;

    const theme = useAppTheme();
    const style = React.useMemo(() => {
        return {
            borderTop: `1px solid ${theme.palette.neutralLight}`,
            padding: "20px 16px",
            display: "flex",
            alignItems: "center",
        };
    }, [theme.palette.neutralLight]);

    return (
        <div style={style}>
            <div style={{ flexGrow: 1 }}>
                <PaneFooterButtons buttons={buttons} />
            </div>
            <div style={{ alignSelf: "right" }}>{children}</div>
        </div>
    );
};

export const PaneFooterButtons = (props: { buttons?: ButtonProps[] }) => {
    const { buttons } = props;
    const style = React.useMemo(() => {
        return {
            display: "flex",
            alignItems: "center",
        };
    }, []);

    return (
        <div style={style}>
            {buttons?.map((buttonProps, idx) => (
                <div key={idx} style={{ marginRight: "8px" }}>
                    <Button {...buttonProps} />
                </div>
            ))}
        </div>
    );
};
