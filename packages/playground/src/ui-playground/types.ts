import "@batch/ui-common";
import { GeneratedResourceStrings as ServiceResourceStrings } from "@batch/ui-service/lib/localization/generated/resources";
import { GeneratedResourceStrings as ReactResourceStrings } from "@batch/ui-react/lib/localization/generated/resources";
import { GeneratedResourceStrings } from "./localization/generated/resources";

// This code augments the LocalizedStrings interface in the common
// module with strings the service, react, and playground modules use.
declare module "@batch/ui-common" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings
        extends ServiceResourceStrings,
            ReactResourceStrings,
            GeneratedResourceStrings {}
}
