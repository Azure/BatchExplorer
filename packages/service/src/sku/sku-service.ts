import { SupportedSku, SupportedSkuType } from "./sku-models";

export interface ListSkusOptions {
    subscriptionId: string;
    type?: SupportedSkuType;
    locationName: string;
}

export interface SkuService {
    list(options: ListSkusOptions): Promise<SupportedSku[]>;
}
