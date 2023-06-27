import { FeatureDefinition } from "@batch-flask/ui";

/**
 * Define components in the UI that the end-user can choose to show or hide.
 * These shouldn't be things like 'add', 'edit', delete' as these should be permissions
 * based and it doesn't really make sense for a user to stop themselves being able
 * to add a job. In this case they could just hide all job actions.
 *
 * 'clone', 'export', 'pin', would be items that are not crutial to the general
 * operation of the application and those which a user could decide that they were
 * not really interested in.
 */
export interface BatchLabsFeatureDefinition extends FeatureDefinition {
    job: boolean | JobFeatures;
    schedule: boolean | ScheduleFeatures;
    pool: boolean | PoolFeatures;
    package: boolean | PackageFeatures;
    certificate: boolean | CertificateFeatures;
    data: boolean | DataFeatures;
    gallery: boolean | GalleryFeatures;
}

export interface CommonFeatures {
    action: boolean | any;
}

export interface JobFeatures extends CommonFeatures {
    statistics: boolean;
    tags: boolean;
    configuration: {
        json: boolean;
    };
    action: {
        clone: boolean;
        exportAsJson: boolean;
        pin: boolean;
    };
}

export interface ScheduleFeatures extends CommonFeatures {
    tags: boolean;
    configuration: {
        json: boolean;
    };
    action: {
        clone: boolean;
        exportAsJson: boolean;
        pin: boolean;
    };
}

export interface PoolFeatures extends CommonFeatures {
    tags: boolean;
    graphs: {
        insights: boolean;
        nodes: boolean;
        tasks: boolean;
    };
    configuration: {
        json: boolean;
    };
    nodes: boolean;
    action: {
        clone: boolean;
        exportAsJson: boolean;
        pin: boolean;
    };
}

export interface PackageFeatures extends CommonFeatures {
    action: {
        pin: boolean;
    };
}

export interface CertificateFeatures extends CommonFeatures {
    configuration: {
        json: boolean;
    };
    action: {
        exportAsJson: boolean;
        pin: boolean;
    };
}

export interface DataFeatures extends CommonFeatures {
    action: {
        pin: boolean;
    };
}

export type GalleryFeatures = CommonFeatures;
