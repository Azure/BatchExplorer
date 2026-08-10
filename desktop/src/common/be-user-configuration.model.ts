import { BatchFlaskUserConfiguration, EntityConfigurationView } from "@batch-flask/core";

/**
 * General configuration used both on browser and desktop
 */
export interface BEUserConfiguration extends BatchFlaskUserConfiguration {
    theme: string;

    externalBrowserAuth: boolean;

    features: {
        multiRegionPoolBootstrap: boolean,
    };

    multiRegionPoolBootstrap: {
        scope: {
            maxTargetPerAccount: number,
        };
        pool: {
            vmSize: string,
        };
        execution: {
            retryBackoffSeconds: number[],
        };
        policy: {
            dedicatedOnly: boolean,
        };
    };

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

    tenants: {
        [tenantId: string]: "active" | "inactive"
    }
}

export const DEFAULT_BE_USER_CONFIGURATION: BEUserConfiguration = {
    entityConfiguration: {
        defaultView: EntityConfigurationView.Pretty,
    },
    features: {
        multiRegionPoolBootstrap: false,
    },
    multiRegionPoolBootstrap: {
        scope: {
            maxTargetPerAccount: 20,
        },
        pool: {
            vmSize: "Standard_D2s_v3",
        },
        execution: {
            retryBackoffSeconds: [2, 4, 8, 16, 32],
        },
        policy: {
            dedicatedOnly: true,
        },
    },
    subscriptions: {
        ignore: [],
    },
    tenants: {},
    update: {
        channel: null,
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
    theme: "classic",
    externalBrowserAuth: true
};
