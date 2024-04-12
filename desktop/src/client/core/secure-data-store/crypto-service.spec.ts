import { CryptoService } from "./crypto-service";

describe("CryptoService", () => {
    let service: CryptoService;
    let keytarSpy;

    let masterKey: string | null = null;

    beforeEach(() => {
        // Fake testing key needs to be 32 characters long
        masterKey = "------fake-key-for-testing------";
        keytarSpy = {
            setPassword: jasmine.createSpy("setPassword").and.callFake((x) => {
                masterKey = x;
                return Promise.resolve();
            }),
            getPassword: jasmine.createSpy("getPassword").and.callFake(() => Promise.resolve(masterKey)),
        };

        service = new CryptoService(keytarSpy);
    });

    it("sets a new master password if not is found", async () => {
        masterKey = null;
        service = new CryptoService(keytarSpy);
        const key = await (service as any)._masterKey;
        expect(key).not.toBeFalsy();
        expect(key!.length).toBe(32);
    });

    it("retrieve the master password", async () => {
        const key = await (service as any)._masterKey;
        expect(key).not.toBeFalsy();
        expect(key!.length).toBe(32);
    });

    it("encrypt and decrypt a string correctly", async () => {
        const message = "this is some super secure text";
        const encrypted = await service.encrypt(message);
        expect(encrypted).not.toEqual(message);
        const decrypted = await service.decrypt(encrypted);
        expect(decrypted).toEqual(message);
    });
});
