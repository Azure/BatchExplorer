import { InMemoryDataStore } from "@batch-flask/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { BatchExplorerProperties } from "client/core/properties/batch-explorer-properties";
import { Constants } from "common";

describe("BatchExplorerProperties", () => {
    let store: InMemoryDataStore;
    let properties: BatchExplorerProperties;
    let envFromObs: AzureEnvironment;

    beforeEach(() => {
        envFromObs = null;
        store = new InMemoryDataStore();
        properties = new BatchExplorerProperties(store);
        properties.azureEnvironmentObs.subscribe(x => envFromObs = x);
    });

    describe("azureEnvironment", () => {
        it("default to public cloud if not set", async () => {
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzureEnvironment.Azure);

            expect(envFromObs).toBe(AzureEnvironment.Azure);
        });

        it("loads the environment from the store", async () => {
            await store.setItem(Constants.localStorageKey.azureEnvironment, AzureEnvironment.AzureChina.id);
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzureEnvironment.AzureChina);

            expect(envFromObs).toBe(AzureEnvironment.AzureChina);
        });

        it("updates the enviromnent in the store", async () => {
            await properties.init();
            await properties.updateAzureEnvironment(AzureEnvironment.AzureGermany);
            expect(properties.azureEnvironment).toBe(AzureEnvironment.AzureGermany);

            expect(envFromObs).toBe(AzureEnvironment.AzureGermany);

            const id = await store.getItem(Constants.localStorageKey.azureEnvironment);
            expect(id).toBe(AzureEnvironment.AzureGermany.id);
        });
    });
});
