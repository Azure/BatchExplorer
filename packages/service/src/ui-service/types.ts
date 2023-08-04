import "@batch/ui-common";
import { GeneratedResourceStrings } from "./localization/generated/resources";

// This code is in the service module. It augments the LocalizedStrings
// interface in the common module with strings the service module uses.
declare module "@batch/ui-common" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings extends GeneratedResourceStrings {}
}
