export interface NcjParameter {
    type: string;
    defaultValue?: any;
    allowedValues: any[];
    metadata: StringMap<string>;
}

export interface NcjJobConfiguration {
    type: string;
    properties: any;
}

export interface NcjJobTemplate {
    parameters: StringMap<NcjParameter>;
    job: NcjJobConfiguration;
}
