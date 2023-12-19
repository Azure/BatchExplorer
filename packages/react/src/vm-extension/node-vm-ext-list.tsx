import { inject } from "@azure/bonito-core/lib/environment";
import { NodeService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList, VmExtItem } from "./vm-extension-list";

interface NodeVmExtensionListProps {
    accountEndpoint: string;
    poolId: string;
    nodeId: string;
    onItemClick?: (item: VmExtItem) => void;
}

export const NodeVMExtList = (props: NodeVmExtensionListProps) => {
    const { accountEndpoint, poolId, nodeId, onItemClick } = props;

    const [extensions, setExtensions] = React.useState<VmExtItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const nodeService: NodeService = React.useMemo(() => {
        return inject(BatchDependencyName.NodeService);
    }, []);

    React.useEffect(() => {
        setLoading(true);
        nodeService
            .listBatchNodeExtensions(accountEndpoint, poolId, nodeId)
            .then((resList) => {
                const exts = [];
                if (resList) {
                    for (const ext of resList) {
                        ext.vmExtension &&
                            exts.push({
                                ...ext.vmExtension,
                                provisioningState: ext.provisioningState,
                                instanceView: ext.instanceView,
                            });
                    }
                }
                setExtensions(exts);
                setLoading(false);
            });
    }, [accountEndpoint, nodeId, nodeService, poolId]);

    return (
        <VmExtensionList
            extensions={extensions}
            loading={loading}
            onItemClick={onItemClick}
        />
    );
};
