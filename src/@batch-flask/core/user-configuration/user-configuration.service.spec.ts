import { BehaviorSubject, Subscription } from "rxjs";
import { BatchFlaskUserConfiguration, UserConfigurationService } from "./user-configuration.service";

interface Settings extends BatchFlaskUserConfiguration {
    foo: string;
    bar: number;
}

const defaultSettings: Settings = {
    foo: "default-value",
    bar: null,
};

describe("UserConfigurationService", () => {
    let service: UserConfigurationService<Settings>;
    let store;

    let current: Settings;

    beforeEach(() => {
        store = {
            config: new BehaviorSubject({
                foo: "some-value",
                bar: 123,
            }),
            save: jasmine.createSpy("save"),
        };
        service = new UserConfigurationService(store, defaultSettings);
        service.config.subscribe(x => current = x);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("gets the current settings", () => {
        expect(service.current).toEqual({
            foo: "some-value",
            bar: 123,
        });
    });

    it("gets the current value for a key", async  () => {
        expect(await service.get("foo")).toEqual("some-value");
        expect(await service.get("bar")).toEqual(123);
    });

    it("updates a setting", async () => {
        await service.set("foo", "some-other");
        expect(service.current).toEqual({
            foo: "some-other",
            bar: 123,
        });
        expect(current).toEqual({
            foo: "some-other",
            bar: 123,
        });
        expect(store.save).toHaveBeenCalledTimes(1);
        await service.set("bar", 0);
        expect(store.save).toHaveBeenCalledTimes(2);
        expect(service.current).toEqual({
            foo: "some-other",
            bar: 0,
        });
        expect(current).toEqual({
            foo: "some-other",
            bar: 0,
        });
    });

    describe("when watching a specific key", () => {
        let spy: jasmine.Spy;
        let sub: Subscription;

        beforeEach(() => {
            spy = jasmine.createSpy("watchCallback");
            sub = service.watch("foo").subscribe(spy);
        });

        afterEach(() => {
            sub.unsubscribe();
        });

        it("observe a specific key", () => {
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("some-value");
            store.config.next({
                foo: "new-value",
                bar: 9,
            });
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith("new-value");
        });

        it("doesn't emit when key is not changed but other settings are", () => {
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("some-value");
            store.config.next({
                foo: "some-value",
                bar: 9,
            });
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
