import { BehaviorSubject, Subscription } from "rxjs";
import { GLOBAL_STORAGE } from "./key";
import { RendererGlobalStorage } from "./renderer-global-storage";

describe("RendererGlobalStorage", () => {
    let service: RendererGlobalStorage;
    let mainGlobalStorageSpy;
    let sharedInjectorSpy;
    let zoneSpy;
    let content: BehaviorSubject<string>;
    let sub: Subscription;

    beforeEach(() => {
        content = new BehaviorSubject<string>(`{"foo": "bar"}`);
        mainGlobalStorageSpy = {
            watchContent: jasmine.createSpy("watchContent").and.returnValue(content),
            save: jasmine.createSpy("save").and.returnValue(Promise.resolve()),
        };
        sharedInjectorSpy = {
            get: jasmine.createSpy("sharedInjector.get").and.returnValue(mainGlobalStorageSpy),
        };

        zoneSpy = {
            run: x => x(),
        };
        service = new RendererGlobalStorage(sharedInjectorSpy, zoneSpy);
    });

    afterEach(() => {
        if (sub) {
            sub.unsubscribe();
        }
    });

    it("gets the main service", () => {
        expect(sharedInjectorSpy.get).toHaveBeenCalledWith(GLOBAL_STORAGE);
    });

    it("save the content by sending it to the main service", () => {
        service.save("my-data", "new-content");
        expect(mainGlobalStorageSpy.save).toHaveBeenCalledTimes(1);
        expect(mainGlobalStorageSpy.save).toHaveBeenCalledWith("my-data", "new-content");
    });

    it("save the value by sending it serialized to the main service", () => {
        service.set("my-data", { newVal: 123 });
        expect(mainGlobalStorageSpy.save).toHaveBeenCalledTimes(1);
        expect(mainGlobalStorageSpy.save).toHaveBeenCalledWith("my-data", JSON.stringify({ newVal: 123 }));
    });

    it("watch the content from the main process", () => {
        const callback = jasmine.createSpy("callback");
        sub = service.watchContent("my-data").subscribe(callback);
        expect(mainGlobalStorageSpy.watchContent).toHaveBeenCalledWith("my-data");
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(`{"foo": "bar"}`);

        content.next(`other-content`);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(`other-content`);
    });

    it("watch the value from the main process", () => {
        const callback = jasmine.createSpy("callback");
        sub = service.watch("my-data").subscribe(callback);
        expect(mainGlobalStorageSpy.watchContent).toHaveBeenCalledWith("my-data");
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ foo: "bar" });

        content.next(`{"other": 123}`);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith({ other: 123 });
    });
});
