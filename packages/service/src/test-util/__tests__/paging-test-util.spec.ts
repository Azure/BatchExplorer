import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { createPagedArray } from "../paging-test-util";

describe("createPagedArray function", () => {
    let result: PagedAsyncIterableIterator<string>;

    beforeEach(() => {
        result = createPagedArray([
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
        ]);
    });

    test("Can be used as iterable", async () => {
        const resultFromIterable = [];
        for await (const num of result) {
            resultFromIterable.push(num);
        }
        expect(resultFromIterable.join(", ")).toEqual(
            "one, two, three, four, five, six, seven"
        );
    });

    test("Can be used as iterator", async () => {
        expect(await result.next()).toEqual({ value: "one", done: false });
        expect(await result.next()).toEqual({ value: "two", done: false });
        expect(await result.next()).toEqual({ value: "three", done: false });
        expect(await result.next()).toEqual({ value: "four", done: false });
        expect(await result.next()).toEqual({ value: "five", done: false });
        expect(await result.next()).toEqual({ value: "six", done: false });
        expect(await result.next()).toEqual({ value: "seven", done: false });
        expect(await result.next()).toEqual({ value: undefined, done: true });
    });

    test("Can iterate by page", async () => {
        const pages = result.byPage();
        expect((await pages.next()).value.join(", ")).toEqual(
            "one, two, three, four, five"
        );
        expect((await pages.next()).value.join(", ")).toEqual("six, seven");
        expect(await pages.next()).toEqual({
            value: undefined,
            done: true,
        });
    });
});
