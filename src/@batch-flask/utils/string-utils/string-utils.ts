export class StringUtils {

    /**
     * Simple wildcard matching
     * @param str String to match
     * @param wildcard Wild to test against
     * @returns Boolean if the string match the wildcard
     */
    public static matchWildcard(str: string, wildcard: string, caseSensitive = true) {
        const flags = caseSensitive ? undefined : "i";
        return new RegExp(`^${wildcard.replace(/\*/g, ".*")}$`, flags).test(str);
    }

    /**
     * Remove the given prefix from the given string. Returns the output.
     * @param name Name containing the prefix
     * @param prefix Prefix to remove
     */
    public static removePrefix(name: string, prefix: string): string {
        if (name.startsWith(prefix)) {
            return name.substring(prefix.length, name.length);
        } else {
            return name;
        }
    }
}
