/**
 * Capitalize the first character of the given string
 * @param str The input string
 * @returns A new string with the first character capitalized
 */
export function capitalizeFirst(str: string): string {
    if (str === "") {
        return str;
    }
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}

/**
 * Case insensitive string equality. Note that if both strings are either null,
 * undefined or empty string they will be considered equal.
 *
 * @param str1 The first string to compare
 * @param str2 The second string to compare
 * @returns True if the strings are equal, or if both values are null or undefined.
 *          False otherwise.
 */
export function equalsIgnoreCase(str1?: string, str2?: string): boolean {
    if (str1 == null) {
        str1 = "";
    }
    if (str2 == null) {
        str2 = "";
    }
    return str1.toLowerCase() === str2.toLowerCase();
}
