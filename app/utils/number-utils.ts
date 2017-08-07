export class NumberUtils {
    public static pretty(value: number, decimals = 2): string {
        const [intPart, decPart] = value.toFixed(decimals).split(".");
        const formated = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (value % 1 === 0) {
            return formated;
        }
        return `${formated}.${decPart}`;
    }
}
