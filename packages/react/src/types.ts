import "@azure/bonito-core";
import { GeneratedResourceStrings as BonitoUiResourceStrings } from "@azure/bonito-ui/lib/generated/localization/resources";
import { GeneratedResourceStrings as ServiceResourceStrings } from "@batch/ui-service/lib/generated/localization/resources";
import { GeneratedResourceStrings } from "./generated/localization/resources";

/**
 * Augment the localized strings provided in bonito-core
 */
declare module "@azure/bonito-core" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings
        extends BonitoUiResourceStrings,
            ServiceResourceStrings,
            GeneratedResourceStrings {}
}
