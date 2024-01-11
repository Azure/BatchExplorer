import React from "react";
import {
    VmExtensionList,
    VmExtItem,
} from "@batch/ui-react/lib/vm-extension/vm-extension-list";
import { DemoPane } from "../../../layout/demo-pane";
import { VmExtensionDetailsPanel } from "@batch/ui-react";
import { allExtItems } from "@batch/ui-react/lib/vm-extension/mock-vme-ext-items";

export const VmExtensionListDemo: React.FC = () => {
    const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
    const [selectedExtension, setSelectedExtension] =
        React.useState<VmExtItem>();

    return (
        <DemoPane title="VM Extension List">
            <VmExtensionList
                extensions={allExtItems}
                loading={false}
                onItemClick={(item) => {
                    setSelectedExtension(item);
                    setPanelOpen(true);
                }}
            />
            <VmExtensionDetailsPanel
                isOpen={panelOpen}
                vme={selectedExtension}
                onDismiss={() => setPanelOpen(false)}
            />
        </DemoPane>
    );
};
