/**
 * Copies a given string to the clipboard. Due to browser security features,
 * this *must* be called within a user-initiated event handler callback.
 *
 * @param text The text to copy
 *
 * @return A promise which resolves when the clipboard has been
 *         successfully updated and rejects on any failure.
 */
export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
}
