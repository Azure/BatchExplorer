import { EntityConfigurationView } from "@batch-flask/ui/batch-flask-settings";

export enum Theme {
    classic = "classic",
}

/**
 * Interface mapping how the settings should be
 */
export interface Settings {
    fileTypes: StringMap<string[]>;
    "configuration.default-view": EntityConfigurationView;
    "subscription.ignore": string[];
    "storage.default-upload-container": string;
    "auto-update-on-quit": boolean;
    "terminal.external": string;
    "node-connect.default-username": string;
}
