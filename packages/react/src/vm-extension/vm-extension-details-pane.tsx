import React from "react";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import { VmExtItem } from "./vm-extension-list";
import { VmExtensionDetails } from "./vm-extension-details";
import { PaneFooter } from "@azure/bonito-ui/lib/components";
import { translate } from "@azure/bonito-core";

interface VmExtensionDetailsProps {
    vme?: VmExtItem;
}

export const VmExtensionDetailsPanel = (
    props: VmExtensionDetailsProps & {
        isOpen: boolean;
        onDismiss: () => void;
    }
) => {
    const { vme, isOpen, onDismiss } = props;

    const shouldOpen = React.useMemo(() => {
        return Boolean(isOpen && vme);
    }, [isOpen, vme]);
    return (
        <Panel
            headerText={translate("lib.react.vmExtension.extensionProperties")}
            isOpen={shouldOpen}
            onDismiss={onDismiss}
            isBlocking={false}
            type={PanelType.custom}
            customWidth="650px"
            onRenderFooterContent={() => (
                <PaneFooter
                    buttons={[
                        {
                            label: "Close",
                            onClick: onDismiss,
                            primary: true,
                        },
                        {
                            label: "Close2",
                            onClick: onDismiss,
                        },
                        {
                            label: "Close3",
                            onClick: onDismiss,
                        },
                    ]}
                >
                    <span>Other stuff</span>
                </PaneFooter>
            )}
            isFooterAtBottom={true}
            styles={{
                footerInner: {
                    padding: "0px",
                },
            }}
        >
            <VmExtensionDetails vme={vme} />
        </Panel>
    );
};
