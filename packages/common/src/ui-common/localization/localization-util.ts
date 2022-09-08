import { getEnvironment } from "../environment";
import { Localizer } from "./localizer";

export function translate(message: string): string {
    return getLocalizer().translate(message);
}

export function getLocalizer(): Localizer {
    return getEnvironment().getLocalizer();
}
