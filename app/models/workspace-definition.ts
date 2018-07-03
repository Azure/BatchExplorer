// TODO: expand on these.
export interface FeatureDefinition {
    job: boolean | JobFeatures;
    schedule: boolean | ScheduleFeatures;
    pool: boolean | PoolFeatures;
    package: boolean | PackageFeatures;
    certificate: boolean | CertificateFeatures;
    data: boolean | DataFeatures;
    gallery: boolean | GalleryFeatures;
}

// TODO: expand on these.
export interface CommonFeatures {
    view: boolean;
    add: boolean;
}

export interface JobFeatures extends CommonFeatures {

}

export interface ScheduleFeatures extends CommonFeatures {

}

export interface PoolFeatures extends CommonFeatures {

}

export interface PackageFeatures extends CommonFeatures {

}

export interface CertificateFeatures extends CommonFeatures {

}

export interface DataFeatures extends CommonFeatures {

}

export interface GalleryFeatures extends CommonFeatures {

}

/**
 * Define the visible state of conponents in the UI
 */
export interface WorkspaceDefinition {
    id: string;
    displayName: string;
    description: string;
    features: FeatureDefinition;
}
