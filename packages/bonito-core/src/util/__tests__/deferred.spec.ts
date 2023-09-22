import { Deferred } from "../deferred";

describe("Deferred tests", () => {
    test("resolve", () => {
        const deferred = new Deferred<string>();

        expect(deferred.resolve).toBeDefined();
        expect(deferred.reject).toBeDefined();
        expect(deferred.done).toBe(false);
        expect(deferred.resolved).toBe(false);
        expect(deferred.rejected).toBe(false);
        expect(deferred.resolvedTo).toBeUndefined();
        expect(deferred.rejectedTo).toBeUndefined();
        expect(deferred.promise).toBeDefined();

        deferred.resolve("Did it!");

        expect(deferred.done).toBe(true);
        expect(deferred.resolved).toBe(true);
        expect(deferred.rejected).toBe(false);
        expect(deferred.resolvedTo).toBe("Did it!");
        expect(deferred.rejectedTo).toBeUndefined();
    });

    test("reject", async () => {
        const deferred = new Deferred<string>();

        deferred.reject("Didn't do it :(");

        let caughtRejection = false;
        try {
            await deferred.promise;
        } catch (e) {
            caughtRejection = true;
        }

        expect(caughtRejection).toBe(true);

        expect(deferred.done).toBe(true);
        expect(deferred.resolved).toBe(false);
        expect(deferred.rejected).toBe(true);
        expect(deferred.rejectedTo).toBe("Didn't do it :(");
        expect(deferred.resolvedTo).toBeUndefined();
    });
});
