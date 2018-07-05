/**
 * Define the visible state of conponents in the UI
 */
export interface WorkspaceDefinition {
    id: string;
    displayName: string;
    description: string;
    features: FeatureDefinition;
}

export interface FeatureDefinition {
    job: boolean | JobFeatures;
    schedule: boolean | ScheduleFeatures;
    pool: boolean | PoolFeatures;
    package: boolean | PackageFeatures;
    certificate: boolean | CertificateFeatures;
    data: boolean | DataFeatures;
    gallery: boolean | GalleryFeatures;
}

export interface CommonFeatures {
    view: boolean | any;
    action: boolean | any;
}

// TODO: Still a little unsure if this is correct.
export interface JobFeatures  extends CommonFeatures {
    view: {
        graphs: boolean;
        statistics: boolean;
        tags: boolean;
        configuration: {
            json: boolean;
        }
    };

    action: {
        add: boolean;
        delete: boolean;
        edit: boolean;
        addTask: boolean;
        terminate: boolean;
        clone: boolean;
        schedule: boolean;
        export: boolean;
        pin: boolean;
    };
}

export interface ScheduleFeatures extends CommonFeatures {

}

export interface PoolFeatures extends CommonFeatures {
    view: {
        cost: boolean;
        tags: boolean;
        asJson: boolean;
        availableNodes: boolean;
        runningTasks: boolean;
        appInsights: boolean;
        nodes: boolean;
    };

    action: {
        add: boolean;
        delete: boolean;
        addJob: boolean;
        resize: boolean;
        clone: boolean;
        export: boolean;
        pin: boolean;
    };
}

export interface PackageFeatures extends CommonFeatures {
    action: {
        add: boolean;
        delete: boolean;
        addVersion: boolean;
        edit: boolean;
        pin: boolean;
    };
}

export interface CertificateFeatures extends CommonFeatures {
    action: {
        add: boolean;
        delete: boolean;
        reactivate: boolean;
        export: boolean;
        pin: boolean;
    };
}

export interface DataFeatures extends CommonFeatures {
    view: {
        fileGroups: boolean;
        containers: boolean;
        accounts: boolean;
    };

    action: {
        addContainer: boolean;
        deleteContainer: boolean;
        addFileGroup: boolean;
        deleteFileGroup: boolean;
        modify: boolean;
        download: boolean;
        pin: boolean;
    };
}

export interface GalleryFeatures extends CommonFeatures {

}
