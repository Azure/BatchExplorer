import { StorageBlobAdapter } from "./storage-blob-adapter";
import { isNode } from "@azure/core-http";

describe("StorageBlobAdapter", () => {
    let adapter: StorageBlobAdapter;
    beforeEach(() => adapter = new StorageBlobAdapter(null));

    describe("listContainer", () => {
        let serviceClientSpy;
        it("should return paged results", async () => {
            const baseParams = { url: "url", account: "account", key: "key" };
            serviceClientSpy = spyOn<any>(adapter, "getServiceClient")
                .and.returnValue({
                    listContainers: () => ({
                        byPage: containerCountGenerator(20)
                    })
                });
            let response = await adapter.listContainers(baseParams);
            expect(response.data.length).toEqual(20);

            serviceClientSpy.calls.reset();

            response = await adapter.listContainers({
                ...baseParams,
                options: { maxPageSize: 6, maxPages: 3 }
            });
            expect(response.data.length).toEqual(18);

            response = await adapter.listContainers({
                ...baseParams,
                continuationToken: response.continuationToken,
                options: { maxPageSize: 6, maxPages: 3 }
            });
            expect(response.data.length).toEqual(2);
        });
    });

    describe("listBlobs", () => {
        const baseParams = {
            url: "url",
            account: "account",
            key: "key",
            containerName: "container",
        };
        let containerClientSpy;
        function mockListBlobs(params: { count?: number; blobs?: string[] }) {
            const { count, blobs } = params;
            containerClientSpy =
                spyOn<any>(adapter, "getContainerClient").and.returnValue({
                    listBlobsByHierarchy: () => ({
                        byPage: count ?
                            blobCountGenerator(count) :
                            blobItemGenerator(blobs)
                    }),
                    listBlobsFlat: () => ({
                        byPage: count ?
                            blobCountGenerator(count) :
                            blobItemGenerator(blobs, true)
                    })
                });
        }

        it("should return paged results", async () => {
            const params = {
                ...baseParams,
                options: {
                    maxPages: 2,
                    maxPageSize: 50
                }
            };
            mockListBlobs({ count: 180 });
            let response = await adapter.listBlobs(params);
            expect(response.data.length).toEqual(100);
            response = await adapter.listBlobs({
                ...params, continuationToken: response.continuationToken
            });
            expect(response.data.length).toEqual(80);
            expect(response.continuationToken).not.toBeDefined();
        });
        it("should handle the recursive option", async () => {
            const fakeBlobs = [
                "file1.txt",
                "file2.txt",
                "file3.txt",
                "prefixA/file5.txt",
                "prefixA/file6.txt"
            ];
            mockListBlobs({ blobs: fakeBlobs });
            let response = await adapter.listBlobs({
                ...baseParams, options: { recursive: false }
            });
            expect(response.data.length).toEqual(4);
            expect(response.data[0]).toEqual(jasmine.objectContaining({
                name: "prefixA",
                url: "container/prefixA",
                isDirectory: true,
            }));
            ["file1.txt", "file2.txt", "file3.txt"].forEach((name, i) => {
                expect(response.data[i + 1]).toEqual(jasmine.objectContaining({
                    name,
                    isDirectory: false
                }));
            });

            containerClientSpy.calls.reset();

            response = await adapter.listBlobs({
                ...baseParams, options: { recursive: true }
            });
            expect(response.data.length).toEqual(5);
            expect(response.data).toEqual(
                fakeBlobs.map(name => jasmine.objectContaining({
                    name, isDirectory: false
                }))
            );
        });
    });
    it("isNode from @azure/core-http should be true in the main process", () => {
        expect(isNode).toBe(true);
    });
});

const indexes = {
    file: 1,
    folder: 1,
    container: 1
};

function nitems(num, type, transformer) {
    return [...Array(num).keys()].map(() => {
        // eslint-disable-next-line security/detect-object-injection
        const index = indexes[type]++;
        return transformer(`${type}${index}`);
    });
}

function blobItem(name) {
    return {
        name,
        properties: {
            contentLength: 20,
            contentType: "type",
            createdOn: null,
            lastModified: null
        }
    };
}

function containerItem(name) {
    return {
        name,
        properties: {
            foo: "bar"
        },
        version: "1.0",
        metadata: {
            key1: "value1"
        }
    };
}

function blobPrefix(name) {
    return { name };
}

function containerCountGenerator(count: number) {
    return countGenerator(count, num => ({
        containerItems: nitems(num, "container", containerItem)
    }));
}

function blobCountGenerator(count: number) {
    return countGenerator(count, (num) => ({
        segment: {
            blobItems: nitems(num, "file", blobItem),
            blobPrefixes: []
        }
    }));
}

function countGenerator<T>(count: number, pageContents: (num: number) => T) {
    return async function* (options) {
        let token = options.continuationToken;
        if (!token) {
            token = "token:0";
        }
        let index =
            parseInt(token.split(":")[1], 10);
        if (count) {
            while (index < count) {
                const size =
                    Math.min(options.maxPageSize, count - index);
                index += size;
                token = (index >= count) ? undefined :
                    `token:${index}`;
                yield {
                    ...pageContents(size),
                    continuationToken: token
                };
            }
        }
    };
}

function blobItemGenerator(items: string[], flat = false) {
    const blobs = [], prefixes = {};
    items.forEach(item => {
        const parts = item.split("/");
        // listBlobsHierarchy only lists top-level prefixes
        if (parts.length > 1) {
            if (flat) {
                blobs.push(blobItem(item));
            } else {
                prefixes[parts[0]] = blobPrefix(parts[0]);
            }
        } else {
            blobs.push(blobItem(item));
        }
    });
    return async function* () {
        yield {
            segment: {
                blobItems: blobs,
                blobPrefixes: Object.values(prefixes)
            }
        };
    };
}
