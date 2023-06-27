/**
 * Finds the first interactive element within an element tree and focuses it.
 *
 * @param element an HTML element tree to focus in
 * @returns Whether an interactive was found and focused
 */
export function focusWithin(element: HTMLElement): boolean {
    if (!element) {
        return false;
    }

    if (isInteractive(element)) {
        element.focus();
        return true;
    }

    for (const child of element.childNodes) {
        if (child instanceof HTMLElement && focusWithin(child)) {
            return true;
        }
    }
    return false;
}

/**
 * Determines if an HTML element is interactive.
 *
 * @param element An HTML element to query
 * @returns whether the element is interactive
 */
export function isInteractive(element: HTMLElement): boolean {

    // The display style will have the computed visibility of the elment,
    // except if its opacity is 0, which should be tested explicitly.
    const style = window.getComputedStyle(element);

    if (style.display === "none" ||
        style.opacity === "0" ||
        element.getAttribute("disabled") === "true") {
        return false;
    }

    if (element.tabIndex >= 0 ||
        element.tagName === "INPUT" ||
        element.tagName === "BUTTON") {
        return true;
    }

    return false;
}
