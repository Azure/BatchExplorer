export class StringUtils {

    /**
     * Simple wildcard matching
     * @param str String to match
     * @param wildcard Wild to test against
     * @returns Boolean if the string match the wildcard
     */
    public static matchWildcard(str: string, wildcard: string) {
        return new RegExp(`^${wildcard.replace("*", ".*")}$`).test(str);
    }
}
