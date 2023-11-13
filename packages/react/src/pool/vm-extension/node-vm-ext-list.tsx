import { inject } from "@azure/bonito-core/lib/environment";
import { ArmBatchModels, NodeService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList } from "./vm-extension-list";

interface NodeVmExtensionListProps {
    accountEndpoint: string;
    poolId: string;
    nodeId: string;
}

export const NodeVMExtList = (props: NodeVmExtensionListProps) => {
    const { accountEndpoint, poolId, nodeId } = props;

    const [extensions, setExtensions] = React.useState<
        ArmBatchModels.VMExtension[]
    >([]);
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
                        ext.vmExtension && exts.push(ext.vmExtension);
                    }
                }
                setExtensions(exts);
                setLoading(false);
            });
    }, [accountEndpoint, nodeId, nodeService, poolId]);

    return <VmExtensionList extensions={extensions} loading={loading} />;
};
