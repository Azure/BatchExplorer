/**
 * Common module is a grouping of components that are being used in many places
 * in different areas of the app(pools, jobs, etc.) but do not belong in the Base Module.
 *
 * Base module -> SHould be utility components that are not techinically tied to BatchExplorer/
 *                This could technically be extracted in its own package
 *
 * Common module -> Batch/BatchExplorer specific components
 */
export * from "./location";
export * from "./common.module";
