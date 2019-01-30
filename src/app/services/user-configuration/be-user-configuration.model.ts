import { BatchFlaskUserConfiguration } from "@batch-flask/core";
import { EntityConfigurationView } from "@batch-flask/ui";

/**
 * General configuration used both on browser and desktop
 */
export interface BEUserConfiguration extends BatchFlaskUserConfiguration {
    theme: string;

    subscriptions: {
        ignore: string[],
    };

    update: {
        channel: string,
        updateOnQuit: boolean,
    };

    storage: {
        defaultUploadContainer: string,
    };

    nodeConnect: {
        defaultUsername: string,
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

    githubData: {
        repo: string,
        branch: string,
    };

    jobTemplate: {
        defaultOutputFileGroup: string | null,
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
        channel: "stable",
        updateOnQuit: true,
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
    jobTemplate: {
        defaultOutputFileGroup: null,
    },
    theme: "classic",
};
