import { inject } from "@azure/bonito-core/lib/environment";
import { PoolService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList, VmExtItem } from "./vm-extension-list";

interface PoolVmExtensionListProps {
    batchAccountId: string;
    poolName: string;
}

export const PoolVMExtList = (props: PoolVmExtensionListProps) => {
    const { batchAccountId, poolName } = props;

    const [extensions, setExtensions] = React.useState<VmExtItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const poolService: PoolService = React.useMemo(() => {
        return inject(BatchDependencyName.PoolService);
    }, []);

    React.useEffect(() => {
        setLoading(true);
        poolService.get(batchAccountId, poolName).then((pool) => {
            const extensions =
                pool?.properties?.deploymentConfiguration
                    ?.virtualMachineConfiguration?.extensions ?? [];
            setExtensions(extensions as VmExtItem[]);
            setLoading(false);
        });
    }, [batchAccountId, poolName, poolService]);

    return <VmExtensionList extensions={extensions} loading={loading} />;
};
