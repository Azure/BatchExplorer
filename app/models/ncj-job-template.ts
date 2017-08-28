export enum NcjParameterRawType {
    string = "string",
    int = "int",
}

export interface NcjParameter {
    type: NcjParameterRawType;
    defaultValue?: any;
    allowedValues?: any[];
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
    pool: NcjJobConfiguration;
    variables: NcjJobConfiguration;
}
