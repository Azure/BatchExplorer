export enum Theme {
    classic = "classic",
}

export enum EntityConfigurationView {
    json = "json",
    pretty = "pretty",
}

/**
 * Interface mapping how the settings should be
 */
export interface Settings {
    fileTypes: StringMap<string[]>;
    "configuration.default-view": EntityConfigurationView;
    "subscription.ignore": string[];
}
