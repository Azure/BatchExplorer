import { BatchFlaskUserConfiguration } from "@batch-flask/core";

/**
 * General configuration used both on browser and desktop
 */
export interface BEUserConfiguration extends BatchFlaskUserConfiguration {

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
        sources: Array<{name: string, path: string}>,
    };
}
