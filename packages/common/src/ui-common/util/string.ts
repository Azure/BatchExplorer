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
