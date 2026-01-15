import { CryptoService, UnsupportedEncryptionVersionError } from "./crypto-service";

describe("CryptoService", () => {
    let service: CryptoService;
    let keytarSpy;

    let masterKeys: { [key: string]: string | null } = {};

    beforeEach(() => {
        // Current key is 64 chars (32 bytes hex)
        masterKeys = {
            "BatchExplorer:master-v2": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        };

        keytarSpy = {
            setPassword: jasmine.createSpy("setPassword").and.callFake(async (service, account, password) => {
                const key = `${service}:${account}`;
                masterKeys[key] = password;
            }),
            getPassword: jasmine.createSpy("getPassword").and.callFake(async (service, account) => {
                const key = `${service}:${account}`;
                return masterKeys[key] || null;
            }),
        };

        service = new CryptoService(keytarSpy);
    });

    it("sets a new master password if not found", async () => {
        masterKeys["BatchExplorer:master-v2"] = null;
        service = new CryptoService(keytarSpy);
        const key = await (service as any)._ensureMasterKey();
        expect(key).not.toBeFalsy();
        expect(key.length).toBe(64);
    });

    it("retrieve the master password", async () => {
        const key = await (service as any)._ensureMasterKey();
        expect(key).not.toBeFalsy();
        expect(key.length).toBe(64);
    });

    it("encrypt and decrypt a string correctly", async () => {
        const message = "this is some super secure text";
        const encrypted = await service.encrypt(message);
        expect(encrypted).not.toEqual(message);
        const decrypted = await service.decrypt(encrypted);
        expect(decrypted).toEqual(message);
    });

    it("rejects legacy encrypted data", async () => {
        // Simulate legacy format: no version header, just [iv(16)] + [encrypted_data]
        const crypto = require("crypto");
        const legacyKeyHex = "0123456789abcdef0123456789abcdef"; // 32-char hex string

        // Create legacy encrypted data that's long enough to pass length check
        const message = "legacy message that needs to be long enough for the minimum length";
        let iv: Buffer;
        do {
            iv = crypto.randomBytes(16);
        } while (iv[0] <= 10);

        const cipher = crypto.createCipheriv("aes-256-ctr", legacyKeyHex, iv);
        const legacyEncrypted = Buffer.concat([iv, cipher.update(Buffer.from(message)), cipher.final()]);

        await expectAsync(service.decrypt(legacyEncrypted.toString("base64")))
            .toBeRejectedWithError(/Unsupported encryption version.*Please re-authenticate/);
    });
});
