import "@azure/bonito-core";
import { GeneratedResourceStrings } from "./generated/localization/resources";

/**
 * Augment the localized strings provided in bonito-core
 */
declare module "@azure/bonito-core" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings extends GeneratedResourceStrings {}
}
