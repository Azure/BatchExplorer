import { MockGlobalStorage } from "@batch-flask/core/testing";
import { BehaviorSubject, Subscription } from "rxjs";
import { UserSpecificDataStore } from "./user-specific-data-store";

describe("UserSpecificDataStore", () => {
    let store: UserSpecificDataStore;
    let globalStorageSpy: MockGlobalStorage;
    let userServiceSpy;
    let sub: Subscription;

    beforeEach(() => {
        globalStorageSpy = new MockGlobalStorage();
        userServiceSpy = {
            currentUser: new BehaviorSubject(null),
        };
        store = new UserSpecificDataStore(globalStorageSpy, userServiceSpy);
    });

    afterEach(() => {
        if (sub) {
            sub.unsubscribe();
        }
        store.ngOnDestroy();
    });

    it("doesn't gets the settings until the user is loaded", () => {
        const spy = jasmine.createSpy("get-item");
        store.getItem("key-1").then(spy);

        expect(spy).not.toHaveBeenCalled();

        userServiceSpy.currentUser.next({ unique_name: "foo@example.com" });
    });

    describe("when the user is loaded", () => {
        beforeEach(() => {
            userServiceSpy.currentUser.next({ unique_name: "foo@example.com" });
        });

        it("defaults to null when there is no value", async () => {
            expect(await store.getItem("key-1")).toEqual(null);
            expect(await store.getItem("key-2")).toEqual(null);
        });

        it("save a value", async () => {
            await store.setItem("key-1", "my-value-1");
            expect(globalStorageSpy.current).toEqual({
                [UserSpecificDataStore.KEY]: JSON.stringify({
                    "foo@example.com": {
                        "key-1": "my-value-1",
                    },
                }),
            });
        });

        it("save a complex value", async () => {
            await store.setItem("key-1", { foo: "bar" });
            expect(globalStorageSpy.current).toEqual({
                [UserSpecificDataStore.KEY]: JSON.stringify({
                    "foo@example.com": {
                        "key-1": { foo: "bar" },
                    },
                }),
            });
        });

        describe("when there is data", () => {
            beforeEach(() => {
                globalStorageSpy.set(UserSpecificDataStore.KEY, {
                    "foo@example.com": {
                        "key-1": "my-value-1",
                        "key-2": { foo: "bar" },
                    },
                    "other@example.com": {
                        "key-1": "my-value-2",
                        "key-3": { foo: 123 },
                    },
                });
            });

            it("get the values for the right user", async () => {
                expect(await store.getItem("key-1")).toEqual("my-value-1");
                expect(await store.getItem("key-2")).toEqual({ foo: "bar" });
                expect(await store.getItem("key-3")).toEqual(null);
            });

            it("it gets value for the new user when switching", async () => {
                userServiceSpy.currentUser.next({ unique_name: "other@example.com" });

                expect(await store.getItem("key-1")).toEqual("my-value-2");
                expect(await store.getItem("key-2")).toEqual(null);
                expect(await store.getItem("key-3")).toEqual({ foo: 123 });
            });

            it("emit the changes when watching and the storage data changes", () => {
                const spy = jasmine.createSpy("watch-item");

                sub = store.watchItem("key-1").subscribe(spy);
                expect(spy).toHaveBeenCalledWith("my-value-1");

                globalStorageSpy.set("user-specific", {
                    "foo@example.com": {
                        "key-1": "my-new-value",
                        "key-2": { foo: "bar" },
                    },
                    "other@example.com": {
                        "key-1": "my-value-2",
                        "key-3": { foo: 123 },
                    },
                });
                expect(spy).toHaveBeenCalledWith("my-new-value");
            });
        });
    });
});
