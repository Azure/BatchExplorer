import { LocalStorage } from "client/core/local-storage";

export function mockStorage(storage: Storage) {
    let data: { [key: string]: string } = {};

    spyOn(storage, "clear").and.callFake(() => {
        data = {};
    });

    spyOn(storage, "setItem").and.callFake((key, value) => {
        data[key] = value;
    });

    spyOn(storage, "getItem").and.callFake((key) => {
        return data[key];
    });

    spyOn(storage, "removeItem").and.callFake((key) => {
        delete data[key];
    });
}

export function mockNodeStorage(storage: LocalStorage) {
    const data: { [key: string]: string } = {};

    spyOn(storage, "setItem").and.callFake((key, value) => {
        data[key] = value;
        return Promise.resolve();
    });

    spyOn(storage, "getItem").and.callFake((key) => {
        return Promise.resolve(data[key]);

    });

    spyOn(storage, "removeItem").and.callFake((key) => {
        delete data[key];
        return Promise.resolve();
    });
}
