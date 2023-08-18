import "@batch/ui-common";
import { GeneratedResourceStrings as ServiceResourceStrings } from "@batch/ui-service/lib/generated/localization/resources";
import { GeneratedResourceStrings as ReactResourceStrings } from "@batch/ui-react/lib/generated/localization/resources";
import { GeneratedResourceStrings as PlaygroundResourceStrings } from "@batch/ui-playground/lib/generated/localization/resources";
import { GeneratedResourceStrings } from "./generated/localization/resources";

// This code augments the LocalizedStrings interface in the common module
// with strings the service, react, playground, and desktop modules use.
declare module "@batch/ui-common" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LocalizedStrings
        extends ServiceResourceStrings,
            ReactResourceStrings,
            PlaygroundResourceStrings,
            GeneratedResourceStrings {}
}
