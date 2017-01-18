export class ArrayUtils {
    public static chunk<T>(array: T[], chunkSize: number): T[][] {
        const chunks = [];
        for (let i = 0, j = array.length; i < j; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}
