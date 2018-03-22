export enum NcjParameterRawType {
    string = "string",
    int = "int",
}

export interface NcjParameter {
    type: NcjParameterRawType;
    defaultValue?: any;
    allowedValues?: any[];
    minValue?: any;
    maxValue?: any;
    minLength?: any;
    maxLength?: any;
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

export interface NcjPoolTemplate {
    parameters: StringMap<NcjParameter>;
    variables?: any;
    pool: any;
}

export enum NcjTemplateType {
    pool = 1,
    job = 2,
    unknown = 3,
}

export enum NcjTemplateMode {
    None,
    NewPoolAndJob,
    ExistingPoolAndJob,
    NewPool,
}
