export enum EntityConfigurationView {
    json = "json",
    pretty = "pretty",
}

export interface BatchFlaskSettings {
    entityConfiguration?: {
        defaultView?: EntityConfigurationView;
    };
    /**
     * If the app should auto udpate on quit
     */
    autoUpdateOnQuit?: boolean;
}
