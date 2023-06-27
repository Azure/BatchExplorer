import { Localizer } from "./localizer";

export class StandardLocalizer implements Localizer {
    translate(message: string): string {
        switch (message) {
            case "subscription":
                return "Subscription";
            case "resourceGroup":
                return "Resource Group";
            case "accountName":
                return "Account Name";
            case "form.buttons.apply":
                return "Apply";
            case "form.buttons.discardChanges":
                return "Discard changes";
        }

        throw new Error("Unable to translate string " + message);
    }
}
