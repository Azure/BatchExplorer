export class ArrayUtils {
    /**
     * Split an array of value into a list of chunks of the given size.
     * @param array List of values to split
     * @param chunkSize What size should the chunks be
     *
     * @example ArrayUtils.chunk([1, 2, 3, 4, 5], 2) => [[1, 2], [3, 4], [5]]
     */
    public static chunk<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0, j = array.length; i < j; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}
