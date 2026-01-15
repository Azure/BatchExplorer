import * as path from "path";
import { SecureDataStore } from "./secure-data-store";
import { UnsupportedEncryptionVersionError } from "./crypto-service";

describe("SecureDataStore", () => {
    let store: SecureDataStore;
    let fsSpy;
    let cryptoSpy;
    let data;

    let fileContent: string | null;

    beforeEach(() => {
        fileContent = null;
        data = JSON.stringify({
            key1: "value1",
            key2: "value2",
        });

        fsSpy = {
            commonFolders: {
                userData: "/home/userdata",
            },
            readFile: jasmine.createSpy("readFile").and.callFake(() => Promise.resolve(fileContent)),
            saveFile: jasmine.createSpy("writeFile").and.callFake((name, x) => {
                fileContent = x;
                return Promise.resolve();
            }),
            delete: jasmine.createSpy("delete").and.returnValue(Promise.resolve()),
        };

        cryptoSpy = {
            encrypt: jasmine.createSpy("encrypt").and.returnValue(Promise.resolve("==encryptedtext==")),
            decrypt: jasmine.createSpy("decrypt").and.callFake(() => Promise.resolve(data)),
        };
    });

    describe("When file doesn't exists", () => {
        beforeEach(() => {
            store = new SecureDataStore(fsSpy, cryptoSpy);
        });

        it("initialize with no keys", async () => {
            expect(await store.getItem("key1")).toBe(undefined);
            expect(await store.getItem("key2")).toBe(undefined);
            expect(cryptoSpy.decrypt).not.toHaveBeenCalled();
        });
    });

    describe("When file has correct value", () => {
        beforeEach(async () => {
            fileContent = "somecontent";
            store = new SecureDataStore(fsSpy, cryptoSpy);
        });

        it("initialize with keys", async () => {
            const value1 = await store.getItem("key1");
            const value2 = await store.getItem("key2");
            expect(value1).toEqual("value1");
            expect(value2).toEqual("value2");
            expect(cryptoSpy.decrypt).toHaveBeenCalledTimes(1);
            expect(cryptoSpy.decrypt).toHaveBeenCalledWith("somecontent");
        });

        it("save a key and update the file", async () => {
            await store.setItem("mycustom", "secret-1");
            expect(cryptoSpy.encrypt).toHaveBeenCalledTimes(1);
            expect(cryptoSpy.encrypt).toHaveBeenCalledWith(JSON.stringify({
                key1: "value1",
                key2: "value2",
                mycustom: "secret-1",
            }));
            expect(fsSpy.saveFile).toHaveBeenCalledWith(path.join("/home/userdata", "data/secure.enc"),
                "==encryptedtext==");
            expect(fileContent).toEqual("==encryptedtext==");
        });
    });

    describe("When file has legacy encrypted data", () => {
        beforeEach(async () => {
            fileContent = "legacy-encrypted-content";
            cryptoSpy.decrypt = jasmine.createSpy("decrypt").and.returnValue(
                Promise.reject(new UnsupportedEncryptionVersionError(1))
            );

            store = new SecureDataStore(fsSpy, cryptoSpy);
        });

        it("sets legacyDataDetected flag to true", async () => {
            expect(await store.legacyDataDetected()).toBe(true);
        });

        it("starts with empty store", async () => {
            const value = await store.getItem("key1");
            expect(value).toBeUndefined();
        });
    });
});
