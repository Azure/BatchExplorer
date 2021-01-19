import * as path from "path";
import { Subscription } from "rxjs";
import { MainGlobalStorage } from "./main-global-storage";

describe("MainGlobalStorage", () => {
    let service: MainGlobalStorage;
    let fsSpy;
    let shellSpy;
    let content: string;

    beforeEach(() => {
        content = `{"foo": "bar"}`;

        fsSpy = {
            readFile: jasmine.createSpy("readFile").and.callFake(() => Promise.resolve(content)),
            saveFile: jasmine.createSpy("saveFile").and.returnValue(Promise.resolve()),
            commonFolders: {
                userData: "~/batch-explorer",
            },
        };

        shellSpy = {
            openItem: jasmine.createSpy("openItem").and.returnValue(Promise.resolve({success: true, errorMessage: ""})),
        };

        service = new MainGlobalStorage(fsSpy, shellSpy);
    });

    it("write to file when calling save", () => {
        service.save("my-data", "my-new-content");
        expect(fsSpy.saveFile).toHaveBeenCalledTimes(1);
        expect(fsSpy.saveFile).toHaveBeenCalledWith(
            path.join("~/batch-explorer", "data", "my-data.json"), "my-new-content");
    });

    it("write to file when calling set", () => {
        service.set("my-data", { content: 123 });
        expect(fsSpy.saveFile).toHaveBeenCalledTimes(1);
        expect(fsSpy.saveFile).toHaveBeenCalledWith(
            path.join("~/batch-explorer", "data", "my-data.json"),
            JSON.stringify({ content: 123 }),
        );
    });

    describe("#watchContent", () => {
        it("only read the file when subscribed to", async () => {
            expect(fsSpy.readFile).not.toHaveBeenCalled();
            const callback = jasmine.createSpy("callback");

            await watchContentAndCallback(service, "my-data", callback);

            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join("~/batch-explorer", "data", "my-data.json"));
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);
        });

        it("only reads the file once if watching twice", async () => {
            expect(fsSpy.readFile).not.toHaveBeenCalled();
            const callback1 = jasmine.createSpy("callback1");
            const callback2 = jasmine.createSpy("callback2");

            await watchContentAndCallback(service, "my-data", callback1);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);

            await watchContentAndCallback(service, "my-data", callback2);

            expect(callback2).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
        });

        it("calls the callback when saving data", async () => {
            const callback = jasmine.createSpy("callback");

            await watchContentAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);

            service.save("my-data", "some-other-content");

            await watchContentAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith(`some-other-content`);
        });

        it("doesn;t the callback when saving data for other key", async () => {
            const callback = jasmine.createSpy("callback");

            await watchContentAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);

            service.save("my-data-2", "some-other-content");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).not.toHaveBeenCalledWith(`some-other-content`);
        });
    });

    describe("#watch", () => {
        it("watch the data parsed as JSON", async () => {
            const callback = jasmine.createSpy("callback");

            await watchAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ foo: "bar" });
        });

        it("returns null when the data is invalid json", async () => {
            content = "invalid-json";
            const callback = jasmine.createSpy("callback");

            await watchAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(null);
        });

        it("calls the callback when saving data", async () => {
            const callback = jasmine.createSpy("callback");

            await watchAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ foo: "bar" });

            service.set("my-data", { other: 123 });

            await watchAndCallback(service, "my-data", callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith({ other: 123 });
        });

        it("only reads the file once if watching twice", async () => {
            expect(fsSpy.readFile).not.toHaveBeenCalled();
            const callback1 = jasmine.createSpy("callback1");
            const callback2 = jasmine.createSpy("callback2");

            await watchAndCallback(service, "my-data", callback1);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);

            await watchAndCallback(service, "my-data", callback2);

            expect(callback2).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
        });
    });
});

/**
 * Subscribes to the service and returns a promise which resolves when the first
 * value is received from watchContent()
 */
async function watchContentAndCallback(service: MainGlobalStorage, key: string, callback: (...args) => any) {
    let sub: Subscription | undefined;
    await new Promise(resolve => {
        sub = service.watchContent(key).subscribe((...args) => {
            callback(...args);
            resolve();
        });
    });
    sub?.unsubscribe();
}

/**
 * Subscribes to the service and returns a promise which resolves when the first
 * value is received from watch()
 */
async function watchAndCallback(service: MainGlobalStorage, key: string, callback: (...args) => any) {
    let sub: Subscription | undefined;
    await new Promise(resolve => {
        sub = service.watch(key).subscribe((...args) => {
            callback(...args);
            resolve();
        });
    });
    sub?.unsubscribe();
}
