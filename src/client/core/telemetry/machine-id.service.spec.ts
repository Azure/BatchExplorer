import { InMemoryDataStore } from "@batch-flask/core";
import { MachineIdService } from "client/core/telemetry/machine-id.service";
import { Constants } from "common";

describe("MachineIdService", () => {
    let service: MachineIdService;
    let dataStore: InMemoryDataStore;

    beforeEach(() => {
        dataStore = new InMemoryDataStore();
        service = new MachineIdService(dataStore as any);
    });

    it("generates a new id when non in storage and saves it", async () => {
        const id = await service.get();

        expect(id).not.toBeNull();
        expect(await dataStore.getItem(Constants.localStorageKey.machineId)).toEqual(id);
    });

    it("use id in local storage", async () => {
        await dataStore.setItem(Constants.localStorageKey.machineId, "some-uuid");
        const id = await service.get();

        expect(id).toEqual("some-uuid");
    });
});
