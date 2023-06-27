const UNITS = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];

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

    public static prettyMagnitude(value: number, suffix: string = ""): string {
        const exponent = NumberUtils.magnitudeExponent(value);
        const decimals = 2;

        const neg = value < 0;

        if (neg) {
            value = -value;
        }

        if (value < 1) {
            return (neg ? "-" : "") + value + suffix;
        }

        const numStr = Number((value / Math.pow(1000, exponent)).toPrecision(decimals + 1));
        const end = UNITS[exponent] + suffix;
        const start = (neg ? "-" : "") + numStr;
        return end ? `${start} ${end}` : start;
    }

    public static magnitudeExponent(value: number) {
        if (!Number.isFinite(value)) {
            throw new TypeError(`Expected a finite number, got ${typeof value}: ${value}`);
        }

        return Math.min(Math.floor(Math.log(Math.abs(value)) / Math.log(1000)), UNITS.length - 1);
    }
    /**
     * Return the number with the ordinal suffix
     * @param value
     */
    public static nth(value: number): string {
        return value.toString() + NumberUtils.ordinal(value);
    }
}
