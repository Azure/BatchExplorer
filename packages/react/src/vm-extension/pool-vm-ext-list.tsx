import { inject } from "@azure/bonito-core/lib/environment";
import { PoolService } from "@batch/ui-service";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import React from "react";
import { VmExtensionList, VmExtItem } from "./vm-extension-list";

interface PoolVmExtensionListProps {
    poolResourceId: string;
    onItemClick?: (item: VmExtItem) => void;
}

export const PoolVMExtList = (props: PoolVmExtensionListProps) => {
    const { poolResourceId, onItemClick } = props;

    const [extensions, setExtensions] = React.useState<VmExtItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const poolService: PoolService = React.useMemo(() => {
        return inject(BatchDependencyName.PoolService);
    }, []);

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        poolService
            .get(poolResourceId)
            .then((pool) => {
                if (!isMounted) {
                    return;
                }
                const extensions =
                    pool?.properties?.deploymentConfiguration
                        ?.virtualMachineConfiguration?.extensions ?? [];
                setExtensions(extensions as VmExtItem[]);
            })
            .finally(() => {
                if (!isMounted) {
                    return;
                }
                setLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [poolResourceId, poolService]);

    return (
        <VmExtensionList
            extensions={extensions}
            loading={loading}
            onItemClick={onItemClick}
        />
    );
};
