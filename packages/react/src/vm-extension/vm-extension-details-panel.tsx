import React from "react";
import { Panel } from "@azure/bonito-ui/lib/components/panel";
import { VmExtItem } from "./vm-extension-list";
import { VmExtensionDetails } from "./vm-extension-details";
import { translate } from "@azure/bonito-core";
import { InstanceViewStatusOutput } from "@batch/ui-service/lib/batch-models";
import { MonacoEditor } from "@azure/bonito-ui/lib/components";

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

    const [isViewSubStatuses, setIsViewSubStatuses] =
        React.useState<boolean>(false);

    const [selectedSubStatuses, setSelectedSubStatuses] = React.useState<
        InstanceViewStatusOutput[] | undefined
    >(undefined);

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
                <VmExtensionDetails
                    vme={vme}
                    onViewDetailedStatus={(subStatuses) => {
                        setSelectedSubStatuses(subStatuses);
                        setIsViewSubStatuses(true);
                    }}
                />
            </Panel>
            <Panel
                headerText={translate(
                    "lib.react.vmExtension.viewDetailedStatus"
                )}
                isOpen={isViewSubStatuses}
                onDismiss={() => {
                    setIsViewSubStatuses(false);
                }}
                isBlocking={true}
                footerButtons={[
                    {
                        label: "Close",
                        onClick: () => {
                            setIsViewSubStatuses(false);
                        },
                    },
                ]}
            >
                <MonacoEditor
                    language="json"
                    value={JSON.stringify(selectedSubStatuses, null, 4)}
                    containerStyle={{
                        width: "100%",
                        height: "100%",
                    }}
                    editorOptions={{
                        readOnly: true,
                        lineNumbers: "on",
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </Panel>
        </>
    );
};
