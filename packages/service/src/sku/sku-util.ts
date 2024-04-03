import { getLocalizer, translate } from "@azure/bonito-core/lib/localization";
import { BatchDependencyName } from "../environment";
import { ListSkusOptions, SkuService } from "./sku-service";
import { inject } from "@azure/bonito-core/lib/environment";

export interface SkuEndOfLifeStatus {
    eolDate: Date;
    warning: string;
}

export interface EndOfLifeStatusQueryOptions extends ListSkusOptions {
    skuName: string;
}

/**
 * Get the end of life status for a SKU
 *
 * @param options - The options for the query
 * @returns The end of life status for the SKU
 * @throws If the SKU is not found
 */
export async function endOfLifeStatus(
    options: EndOfLifeStatusQueryOptions
): Promise<SkuEndOfLifeStatus | null> {
    const { skuName } = options;

    const skuService: SkuService = inject(BatchDependencyName.SkuService);
    const skus = await skuService.list(options);
    const sku = skus.find((s) => s.name === skuName);
    if (!sku) {
        throw new Error(translate("lib.service.sku.notFound", { skuName }));
    }
    if (sku.batchSupportEndOfLife) {
        const eolDate = toDateObject(sku.batchSupportEndOfLife);
        return {
            eolDate,
            warning: translate("lib.service.sku.eolWarning", {
                skuName,
                eolDate: eolDate.toLocaleDateString(
                    getLocalizer().getLocale(),
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }
                ),
            }),
        };
    }
    return null;
}

/**
 * Convert a date string to a Date object.
 *
 * Strips the time portion of the date string to avoid timezone-related issues
 */
function toDateObject(dateString: string): Date {
    dateString = dateString.replace(/[T ].*/, "");
    const [year, month, day] = dateString.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return new Date(dateString);
    }
    return new Date(year, month - 1, day);
}
