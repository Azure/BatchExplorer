import { KeytarService } from "./keytar.service";

describe("KeytarService", () => {
    let service: KeytarService;
    let safeStorageSpy;

    beforeEach(() => {
        safeStorageSpy = {
            setPassword: jasmine.createSpy("setPassword").and.returnValue(Promise.resolve()),
            getPassword: jasmine.createSpy("getPassword").and.returnValue(Promise.resolve(null))
        };

        service = new KeytarService(safeStorageSpy);
    });

    describe("setPassword", () => {
        it("should call safeStorage.setPassword with correct arguments", async () => {
            await service.setPassword("testService", "testAccount", "testPassword");

            expect(safeStorageSpy.setPassword).toHaveBeenCalledWith(
                "testService:testAccount",
                "testPassword"
            );
        });

        it("should not throw when safeStorage.setPassword succeeds", async () => {
            await expectAsync(service.setPassword("testService", "testAccount", "testPassword"))
                .toBeResolved();
        });

        it("should catch and log errors when safeStorage.setPassword fails", async () => {
            const consoleWarnSpy = spyOn(console, "warn");
            const error = new Error("Encryption not available");
            safeStorageSpy.setPassword.and.returnValue(Promise.reject(error));

            await service.setPassword("testService", "testAccount", "testPassword");

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Failed to store credentials securely for testService:testAccount:",
                "Encryption not available"
            );
        });

        it("should not throw when safeStorage.setPassword fails", async () => {
            safeStorageSpy.setPassword.and.returnValue(
                Promise.reject(new Error("Encryption not available"))
            );

            await expectAsync(service.setPassword("testService", "testAccount", "testPassword"))
                .toBeResolved();
        });
    });

    describe("getPassword", () => {
        it("should call safeStorage.getPassword with correct arguments", async () => {
            await service.getPassword("testService", "testAccount");

            expect(safeStorageSpy.getPassword).toHaveBeenCalledWith(
                "testService:testAccount"
            );
        });

        it("should return the password from safeStorage.getPassword", async () => {
            safeStorageSpy.getPassword.and.returnValue(Promise.resolve("retrievedPassword"));

            const result = await service.getPassword("testService", "testAccount");

            expect(result).toBe("retrievedPassword");
        });

        it("should return null when password is not found", async () => {
            safeStorageSpy.getPassword.and.returnValue(Promise.resolve(null));

            const result = await service.getPassword("testService", "testAccount");

            expect(result).toBeNull();
        });

        it("should propagate errors from safeStorage.getPassword", async () => {
            const error = new Error("Storage error");
            safeStorageSpy.getPassword.and.returnValue(Promise.reject(error));

            await expectAsync(service.getPassword("testService", "testAccount"))
                .toBeRejectedWith(error);
        });
    });
});
