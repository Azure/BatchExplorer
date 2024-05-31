import {
    PageSettings,
    PagedAsyncIterableIterator,
    PagedResult,
    getPagedAsyncIterator,
} from "@azure/core-paging";

export const DEFAULT_FAKE_PAGE_SIZE = 5;

export interface FakePagingOptions {
    pageSize: number;
}

/**
 * Create a paged iterator from a basic array. Useful for simulating a
 * paginated list API for testing.
 *
 * @param arr The array which will back the iterator.
 * @param options Paging options.
 * @returns A paged async iterator.
 */
export function createPagedArray<T>(
    arr: T[],
    options?: FakePagingOptions
): PagedAsyncIterableIterator<T, T[]> {
    const pagedResult: PagedResult<T[], PageSettings, number> = {
        firstPageLink: 0,
        async getPage(pageIndex, maxPageSize) {
            const pageSize = maxPageSize || DEFAULT_FAKE_PAGE_SIZE;
            if (pageIndex < arr.length) {
                return Promise.resolve({
                    page: arr.slice(
                        pageIndex,
                        Math.min(pageIndex + pageSize, arr.length)
                    ),
                    nextPageLink:
                        pageSize < arr.length - pageIndex
                            ? pageIndex + pageSize
                            : undefined,
                });
            } else {
                // Should never hit this
                throw new Error(
                    "Unhandled error in createPageArray function. This indicates a bug."
                );
            }
        },
    };

    return getPagedAsyncIterator(pagedResult);
}
