import "@batch/ui-common";
import { GeneratedResourceStrings as ServiceResourceStrings } from "@batch/ui-service/lib/localization/generated/resources";
import { GeneratedResourceStrings } from "./localization/generated/resources";

// This code is in the react module. It augments the LocalizedStrings
// interface in the common module with strings the service module uses.
declare module "@batch/ui-common" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings
        extends ServiceResourceStrings,
            GeneratedResourceStrings {}
}
