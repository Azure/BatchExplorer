import { SafeStorageService } from "./safe-storage.service";
import { IpcEvent } from "common/constants";

describe("SafeStorageService", () => {
    let service: SafeStorageService;
    let ipcSpy;

    beforeEach(() => {
        ipcSpy = {
            send: jasmine.createSpy("send").and.returnValue(Promise.resolve())
        };

        service = new SafeStorageService(ipcSpy);
    });

    it("should call IPC send for setPassword", async () => {
        await service.setPassword("testService", "testAccount", "testPassword");

        expect(ipcSpy.send).toHaveBeenCalledWith(IpcEvent.safeStorage.setPassword, {
            key: "testService:testAccount",
            password: "testPassword"
        });
    });

    it("should call IPC send for getPassword", async () => {
        ipcSpy.send.and.returnValue(Promise.resolve("retrievedPassword"));

        const result = await service.getPassword("testService", "testAccount");

        expect(ipcSpy.send).toHaveBeenCalledWith(IpcEvent.safeStorage.getPassword, {
            key: "testService:testAccount"
        });
        expect(result).toBe("retrievedPassword");
    });

    it("should call IPC send for deletePassword", async () => {
        ipcSpy.send.and.returnValue(Promise.resolve(true));

        const result = await service.deletePassword("testService", "testAccount");

        expect(ipcSpy.send).toHaveBeenCalledWith(IpcEvent.safeStorage.deletePassword, {
            key: "testService:testAccount"
        });
        expect(result).toBe(true);
    });

    it("should call IPC send for isEncryptionAvailable", async () => {
        ipcSpy.send.and.returnValue(Promise.resolve(true));

        const result = await service.isEncryptionAvailable();

        expect(ipcSpy.send).toHaveBeenCalledWith(IpcEvent.safeStorage.isEncryptionAvailable);
        expect(result).toBe(true);
    });
});