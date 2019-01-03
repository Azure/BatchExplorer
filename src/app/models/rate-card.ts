export interface RateCardMeter {
    EffectiveDate: string;
    IncludedQuantity: number;
    MeterCategory: string;
    MeterId: string;
    MeterName: string;
    MeterRates: StringMap<number>;
    MeterRegion: string;
    MeterStatus: string;
    MeterSubCategory: string;
    MeterTags: any[];
    Unit: string;
}
