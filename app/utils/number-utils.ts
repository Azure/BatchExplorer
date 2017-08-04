export class NumberUtils {
    public static pretty(value: number): string {
        return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
