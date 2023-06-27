import { Deferred } from "common";

describe("Deferred", () => {
    it("succeed", () => {
        const deferred = new Deferred();

        const promise = deferred.promise.then((value) => {
            expect(value).toEqual("resolved-value");
        });

        deferred.resolve("resolved-value");
        return promise;
    });

    it("pass error", () => {
        const deferred = new Deferred();

        const promise = deferred.promise.then(() => {
            fail("Promise should not have succeeded here");
        }).catch((value) => {
            expect(value).toEqual("rejected-error");
        });

        deferred.reject("rejected-error");
        return promise;
    });
});
