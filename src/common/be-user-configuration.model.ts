import { BatchFlaskUserConfiguration, EntityConfigurationView } from "@batch-flask/core";

/**
 * General configuration used both on browser and desktop
 */
export interface BEUserConfiguration extends BatchFlaskUserConfiguration {
    theme: string;

    subscriptions: {
        ignore: string[],
    };

    update: {
        channel: string | null,
        updateOnQuit: boolean,
    };

    storage: {
        defaultUploadContainer: string,
    };

    nodeConnect: {
        defaultUsername: string,
    };

    /**
     * Data from the BatchExplorer-data repository.
     * This is general configuration that can be updated for every user of Batch Explorer.
     */
    githubData: {
        repo: string,
        branch: string,
    };

}

/**
 * Configuration specific to the desktop version
 * Note this is the only version yet. Planning for the future.
 */
export interface BEUserDesktopConfiguration extends BEUserConfiguration {
    /**
     * Local templates names and path to show in the template library
     */
    localTemplates: {
        sources: Array<{ name: string, path: string }>,
    };

    jobTemplate: {
        defaultOutputFileGroup: string | null,
    };

    /**
     * Change the Microsoft portfolio source
     */
    microsoftPortfolio: {
        repo: string,
        branch: string,
        path: string,
    };
}

export const DEFAULT_BE_USER_CONFIGURATION: BEUserDesktopConfiguration = {
    localTemplates: {
        sources: [],
    },
    entityConfiguration: {
        defaultView: EntityConfigurationView.Pretty,
    },
    subscriptions: {
        ignore: [],
    },
    update: {
        channel: null,
        updateOnQuit: false,
    },
    storage: {
        defaultUploadContainer: "batch-explorer-input",
    },
    nodeConnect: {
        defaultUsername: "batch-explorer-user",
    },
    githubData: {
        repo: "Azure/BatchExplorer-data",
        branch: "master",
    },
    microsoftPortfolio: {
        repo: "Azure/batch-extension-templates",
        branch: "master",
        path: "templates",
    },
    jobTemplate: {
        defaultOutputFileGroup: null,
    },
    theme: "classic",
};
