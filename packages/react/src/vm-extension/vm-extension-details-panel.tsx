import React from "react";
import { Panel } from "@azure/bonito-ui/lib/components/panel";
import { VmExtItem } from "./vm-extension-list";
import { VmExtensionDetails } from "./vm-extension-details";
import { translate } from "@azure/bonito-core";
interface VmExtensionDetailsPanelProps {
    vme?: VmExtItem;
    isOpen: boolean;
    onDismiss: () => void;
}

export const VmExtensionDetailsPanel = (
    props: VmExtensionDetailsPanelProps
) => {
    const { vme, isOpen, onDismiss } = props;

    const shouldOpen = React.useMemo(() => {
        return Boolean(isOpen && vme);
    }, [isOpen, vme]);

    return (
        <>
            <Panel
                headerText={translate(
                    "lib.react.vmExtension.extensionProperties"
                )}
                isOpen={shouldOpen}
                onDismiss={onDismiss}
                isBlocking={false}
                footerButtons={[
                    {
                        label: "Close",
                        onClick: onDismiss,
                    },
                ]}
            >
                <VmExtensionDetails vme={vme} />
            </Panel>
        </>
    );
};
