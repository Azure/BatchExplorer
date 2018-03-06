export enum EntityConfigurationView {
    json = "json",
    pretty = "pretty",
}

export interface BatchFlaskSettings {
    entityConfiguration?: {
        defaultView?: EntityConfigurationView;
    };
}
