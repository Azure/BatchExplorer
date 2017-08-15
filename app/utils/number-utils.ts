export class NumberUtils {
    public static pretty(value: number, decimals = 2): string {
        const [intPart, decPart] = value.toFixed(decimals).split(".");
        const formated = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (value % 1 === 0) {
            return formated;
        }
        return `${formated}.${decPart}`;
    }

    /**
     * Return the number ordinal suffix
     * @param value
     */
    public static ordinal(value: number): string {
        const j = value % 10;
        const k = value % 100;
        if (j === 1 && k !== 11) {
            return "st";
        }
        if (j === 2 && k !== 12) {
            return "nd";
        }
        if (j === 3 && k !== 13) {
            return "rd";
        }
        return "th";
    }
    /**
     * Return the number with the ordinal suffix
     * @param value
     */
    public static nth(value: number): string {
        return value.toString() + NumberUtils.ordinal(value);
    }
}
