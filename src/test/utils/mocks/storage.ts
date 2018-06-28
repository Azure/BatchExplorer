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
