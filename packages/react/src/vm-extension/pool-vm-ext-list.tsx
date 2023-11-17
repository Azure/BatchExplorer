import { inject } from "@azure/bonito-core/lib/environment";
import { PoolService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList, VmExtItem } from "./vm-extension-list";

interface PoolVmExtensionListProps {
    batchAccountId: string;
    poolId: string;
}

export const PoolVMExtList = (props: PoolVmExtensionListProps) => {
    const { batchAccountId, poolId } = props;

    const [extensions, setExtensions] = React.useState<VmExtItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const poolService: PoolService = React.useMemo(() => {
        return inject(BatchDependencyName.PoolService);
    }, []);

    React.useEffect(() => {
        setLoading(true);
        poolService.get(batchAccountId, poolId).then((pool) => {
            const extensions =
                pool?.properties?.deploymentConfiguration
                    ?.virtualMachineConfiguration?.extensions ?? [];
            setExtensions(extensions as VmExtItem[]);
            setLoading(false);
        });
    }, [batchAccountId, poolId, poolService]);

    return <VmExtensionList extensions={extensions} loading={loading} />;
};
