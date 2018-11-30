import { CryptoService } from "./crypto-service";

fdescribe("CryptoService", () => {
    let service: CryptoService;
    let keytarSpy;

    let masterKey: string | null = null;

    beforeEach(() => {
        masterKey = "fbea88f2f4efeb0640cb411aa7df41cb";
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
