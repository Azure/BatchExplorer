import React, { PropsWithChildren } from "react";
import { Panel as FluentPanel, PanelType } from "@fluentui/react/lib/Panel";
import { ButtonProps } from "../button";
import { PanelFooter } from "./panel-footer";

export interface PanelProps {
    headerText?: string;
    isOpen?: boolean;
    onDismiss?: () => void;
    isBlocking?: boolean;
    footerButtons?: ButtonProps[];
}

export const Panel: React.FC<PropsWithChildren<PanelProps>> = (props) => {
    const { headerText, isOpen, onDismiss, isBlocking, footerButtons } = props;
    return (
        <FluentPanel
            headerText={headerText}
            isOpen={isOpen}
            onDismiss={onDismiss}
            isBlocking={isBlocking}
            isFooterAtBottom={true}
            type={PanelType.custom}
            customWidth="600px"
            onRenderFooterContent={() => (
                <PanelFooter buttons={footerButtons}></PanelFooter>
            )}
            styles={{
                footerInner: {
                    padding: "0px",
                },
                header: {
                    height: "64px",
                },
            }}
        >
            {props.children}
        </FluentPanel>
    );
};
