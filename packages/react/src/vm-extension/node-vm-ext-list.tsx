import { inject } from "@azure/bonito-core/lib/environment";
import { AccountService, NodeService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList, VmExtItem } from "./vm-extension-list";

interface NodeVmExtensionListProps {
    accountResourceId: string;
    poolId: string;
    nodeId: string;
    onItemClick?: (item: VmExtItem) => void;
}

export const NodeVMExtList = (props: NodeVmExtensionListProps) => {
    const { accountResourceId, poolId, nodeId, onItemClick } = props;

    const [extensions, setExtensions] = React.useState<VmExtItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const nodeService: NodeService = React.useMemo(() => {
        return inject(BatchDependencyName.NodeService);
    }, []);

    const accountService: AccountService = React.useMemo(() => {
        return inject(BatchDependencyName.AccountService);
    }, []);

    const fetchExtensions = React.useCallback(async () => {
        const accountData = await accountService.get(accountResourceId);
        if (!accountData) {
            throw new Error(`Account with id ${accountResourceId} not found`);
        }
        const accountEndpoint = accountData.properties?.accountEndpoint;
        if (!accountEndpoint) {
            throw new Error(
                `Account with id ${accountResourceId} does not have an account endpoint`
            );
        }
        setLoading(true);
        try {
            const resList = await nodeService.listVmExtensions(
                accountEndpoint,
                poolId,
                nodeId
            );
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
        } finally {
            setLoading(false);
        }
    }, [accountResourceId, accountService, nodeId, nodeService, poolId]);

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetchExtensions().finally(() => {
            if (!isMounted) {
                return;
            }
            setLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, [fetchExtensions]);

    return (
        <VmExtensionList
            extensions={extensions}
            loading={loading}
            onItemClick={onItemClick}
        />
    );
};
