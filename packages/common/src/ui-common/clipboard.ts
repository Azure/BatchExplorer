let clipboardElement: HTMLTextAreaElement | null = null;
export const clipboardElementId = "be-global-clipboard";

function initializeClipboard() {
    if (clipboardElement) {
        // Early out - already initialized
        return;
    }
    const el = document.createElement("textarea");
    el.id = clipboardElementId;
    el.style.position = "absolute";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    el.style.opacity = "0";
    document.body.appendChild(el);
    clipboardElement = el;
}

/**
 * Copies a given string to the clipboard
 *
 * @param value The string value to copy
 */
export function copyToClipboard(value: string): void {
    if (!clipboardElement) {
        initializeClipboard();
    }
    if (!clipboardElement) {
        console.error("Could not find global clipboard element");
        return;
    }
    clipboardElement.value = value;
    clipboardElement.select();
    document.execCommand("copy");
}
