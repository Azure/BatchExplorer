import * as path from "path";
import { Subscription } from "rxjs";
import { MainGlobalStorage } from "./main-global-storage";

describe("MainGlobalStorage", () => {
    let service: MainGlobalStorage;
    let fsSpy;
    let content: string;
    let sub: Subscription;

    beforeEach(() => {
        content = `{"foo": "bar"}`;

        fsSpy = {
            readFile: jasmine.createSpy("readFile").and.callFake(() => Promise.resolve(content)),
            saveFile: jasmine.createSpy("saveFile").and.returnValue(Promise.resolve()),
            commonFolders: {
                userData: "~/batch-explorer",
            },
        };
        service = new MainGlobalStorage(fsSpy);
    });

    afterEach(() => {
        if (sub) {
            sub.unsubscribe();
        }
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
            sub = service.watchContent("my-data").subscribe(callback);
            await Promise.resolve();

            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledWith(path.join("~/batch-explorer", "data", "my-data.json"));
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);
        });

        it("only reads the file once if watching twice", async () => {
            expect(fsSpy.readFile).not.toHaveBeenCalled();
            const callback1 = jasmine.createSpy("callback1");
            const callback2 = jasmine.createSpy("callback2");
            sub = service.watchContent("my-data").subscribe(callback1);
            await Promise.resolve();

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);

            const sub2 = service.watchContent("my-data").subscribe(callback1);
            await Promise.resolve();
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            sub2.unsubscribe();
        });

        it("calls the callback when saving data", async () => {
            const callback = jasmine.createSpy("callback");
            sub = service.watchContent("my-data").subscribe(callback);
            await Promise.resolve();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);

            service.save("my-data", "some-other-content");

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith(`some-other-content`);
        });

        it("doesn;t the callback when saving data for other key", async () => {
            const callback = jasmine.createSpy("callback");
            sub = service.watchContent("my-data").subscribe(callback);
            await Promise.resolve();

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
            sub = service.watch("my-data").subscribe(callback);
            await Promise.resolve();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ foo: "bar" });
        });

        it("returns null when the data is invalid json", async () => {
            content = "invalid-json";
            const callback = jasmine.createSpy("callback");
            sub = service.watch("my-data").subscribe(callback);
            await Promise.resolve();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(null);
        });

        it("calls the callback when saving data", async () => {
            const callback = jasmine.createSpy("callback");
            sub = service.watch("my-data").subscribe(callback);
            await Promise.resolve();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ foo: "bar" });

            service.set("my-data", { other: 123 });

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith({ other: 123 });
        });

        it("only reads the file once if watching twice", async () => {
            expect(fsSpy.readFile).not.toHaveBeenCalled();
            const callback1 = jasmine.createSpy("callback1");
            const callback2 = jasmine.createSpy("callback2");
            sub = service.watch("my-data").subscribe(callback1);
            await Promise.resolve();

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);

            const sub2 = service.watch("my-data").subscribe(callback1);
            await Promise.resolve();
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(fsSpy.readFile).toHaveBeenCalledTimes(1);
            sub2.unsubscribe();
        });
    });
});
