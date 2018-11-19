import { EntityConfigurationView } from "@batch-flask/ui/batch-flask-settings";

/**
 * Interface mapping how the settings should be
 */
export interface Settings {
    theme: string;
    "file.associations": StringMap<string>;
    "configuration.default-view": EntityConfigurationView;
    "subscription.ignore": string[];
    "storage.default-upload-container": string;
    "auto-update-on-quit": boolean;
    "terminal.external": string;
    "node-connect.default-username": string;
    "github-data.source.branch": string;
    "github-data.source.repo": string;
    "update.channel": string;
    "job-template.default-output-filegroup": string;
}
