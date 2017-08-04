export class NumberUtils {
    public static pretty(value: number, maxDecimals = 2): string {
        const int = Math.floor(value);
        const decimals = value - int;
        const intStr = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const decimalStr = Math.round(decimals * 10 ** maxDecimals);

        return `${intStr}.${decimalStr}`;
    }
}
