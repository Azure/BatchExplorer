import { of } from "rxjs";
import { TenantSettingsService } from ".";

describe("TenantSettingsService", () => {
    let service: TenantSettingsService;
    let configSetSpy: any;
    beforeAll(() => {
        configSetSpy = jasmine.createSpy("set");

        const configSpy = {
            watch: () => ({ pipe: () => of({}) }),
            set: configSetSpy
        } as any;

        service = new TenantSettingsService(configSpy);
    });

    it("sets active and inactive tenants", () => {
        service.setTenantActive("tenant1", true);
        expect(configSetSpy).toHaveBeenCalledWith(
            "tenants", { tenant1: "active" }
        );

        configSetSpy.calls.reset();

        service.setTenantActive("tenant2", false);
        expect(configSetSpy).toHaveBeenCalledWith(
            "tenants", { tenant1: "active", tenant2: "inactive" }
        );
    });
});
