import { cancellablePromise } from "../cancellable-promise";

import { CancelledPromiseError } from "../../errors";

describe("Cancellable promise", () => {
    test("should cancel promise properly", () => {
        const p = Promise.resolve("resolved");
        const cp = cancellablePromise(p);
        cp.cancel();
        return expect(cp).rejects.toThrowError(CancelledPromiseError);
    });

    test("should not cancel promise if it is already resolved or rejected", async () => {
        const p = Promise.resolve("resolved");
        const cp = cancellablePromise(p);
        await expect(cp).resolves.toBe("resolved");
        cp.cancel();
        await expect(cp).resolves.toBe("resolved");

        const p2 = Promise.reject("rejected");
        const cp2 = cancellablePromise(p2);
        await expect(cp2).rejects.toBe("rejected");
        cp2.cancel();
        await expect(cp2).rejects.toBe("rejected");
    });

    test("should override the promise's own rejection", async () => {
        const p = Promise.reject("rejected");
        const cp = cancellablePromise(p);
        cp.cancel();
        await expect(cp).rejects.toThrowError("Promise cancelled");
    });
});
