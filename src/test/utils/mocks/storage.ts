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

export class MockNodeStorage {
    public data: { [key: string]: string } = { };

     public setItem(key: string, value: string) {
        this.data[key] = value;
        return Promise.resolve();
    }

     public getItem(key: string) {
        return Promise.resolve(this.data[key]);
    }

     public removeItem(key: string) {
        delete this.data[key];
        return Promise.resolve();
    }
}
