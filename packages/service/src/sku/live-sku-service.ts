import { AbstractHttpService, getArmUrl } from "@azure/bonito-core";
import { ListSkusOptions, SkuService } from "./sku-service";
import { SupportedSku, SupportedSkuType } from "./sku-models";
import { createARMBatchClient, isUnexpected } from "../internal/arm-batch-rest";
import { createArmUnexpectedStatusCodeError } from "../utils";

const VIRTUAL_MACHINE_SKU_PATH =
    "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/virtualMachineSkus";
const CLOUD_SERVICE_SKU_PATH =
    "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/cloudServiceSkus";

export class LiveSkuService extends AbstractHttpService implements SkuService {
    async list(options: ListSkusOptions): Promise<SupportedSku[]> {
        const {
            subscriptionId,
            locationName,
            type = SupportedSkuType.VirtualMachine,
        } = options;

        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        let res;
        if (type === SupportedSkuType.CloudService) {
            res = await armBatchClient
                .path(CLOUD_SERVICE_SKU_PATH, subscriptionId, locationName)
                .get();
        } else {
            res = await armBatchClient
                .path(VIRTUAL_MACHINE_SKU_PATH, subscriptionId, locationName)
                .get();
        }
        if (isUnexpected(res)) {
            throw createArmUnexpectedStatusCodeError(res);
        }
        return res.body.value ?? [];
    }
}
