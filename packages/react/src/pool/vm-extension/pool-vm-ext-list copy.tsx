import { inject } from "@azure/bonito-core/lib/environment";
import { ArmBatchModels, PoolService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList } from "./vm-extension-list";

interface PoolVmExtensionListProps {
    subscriptionId: string;
    resourceGroupName: string;
    batchAccountName: string;
    poolName: string;
}

export const PoolVMExtList = (props: PoolVmExtensionListProps) => {
    const { subscriptionId, resourceGroupName, batchAccountName, poolName } =
        props;

    const [extensions, setExtensions] = React.useState<
        ArmBatchModels.VMExtension[]
    >([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const poolService: PoolService = React.useMemo(() => {
        return inject(BatchDependencyName.PoolService);
    }, []);

    React.useEffect(() => {
        setLoading(true);
        poolService
            .get(
                `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${batchAccountName}/pools/${poolName}`
            )
            .then((pool) => {
                const extensions =
                    pool?.properties?.deploymentConfiguration
                        ?.virtualMachineConfiguration?.extensions ?? [];
                setExtensions(extensions);
                setLoading(false);
            });
    }, [
        batchAccountName,
        poolName,
        poolService,
        resourceGroupName,
        subscriptionId,
    ]);

    return <VmExtensionList extensions={extensions} loading={loading} />;
};
