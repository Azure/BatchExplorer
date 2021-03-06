import { uniqueId } from "../util";

/**
 * Generates a unique ID to be used by DOM elements
 *
 * @param elementName An optional descriptive name of the element.
 *
 * @return A globally unique ID string of the form `be-${elementName}-${numericId}`
 */
export function uniqueElementId(elementName: string = "element"): string {
    return uniqueId(`be-${elementName}`);
}
