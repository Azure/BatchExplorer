export enum EntityConfigurationView {
    JSON = "json",
    Pretty = "pretty",
}

export interface BatchFlaskSettings {
    entityConfiguration?: {
        defaultView?: EntityConfigurationView;
    };
    /**
     * If the app should auto udpate on quit
     */
    autoUpdateOnQuit?: boolean;
    fileAssociations: StringMap<string>;
}
