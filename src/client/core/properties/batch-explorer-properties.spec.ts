import { InMemoryDataStore } from "@batch-flask/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { BatchExplorerProperties } from "client/core/properties/batch-explorer-properties";
import { Constants } from "common";

describe("BatchExplorerProperties", () => {
    let store: InMemoryDataStore;
    let properties: BatchExplorerProperties;

    beforeEach(() => {
        store = new InMemoryDataStore();
        properties = new BatchExplorerProperties(store);
    });

    describe("azureEnvironment", () => {
        it("default to public cloud if not set", async () => {
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzureEnvironment.Azure);

            const env = await properties.azureEnvironmentObs.toPromise();
            expect(env).toBe(AzureEnvironment.Azure);
        });

        it("loads the environment from the store", async () => {
            await store.setItem(Constants.localStorageKey.azureEnvironment, AzureEnvironment.AzureChina.id);
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzureEnvironment.AzureChina);

            const env = await properties.azureEnvironmentObs.toPromise();
            expect(env).toBe(AzureEnvironment.AzureChina);
        });

        it("updates the enviromnent in the store", async () => {
            await properties.init();
            properties.updateAzureEnvironment(AzureEnvironment.AzureGermany);
            expect(properties.azureEnvironment).toBe(AzureEnvironment.AzureGermany);

            const env = await properties.azureEnvironmentObs.toPromise();
            expect(env).toBe(AzureEnvironment.AzureGermany);
            expect(await store.getItem(Constants.localStorageKey.azureEnvironment)).toBe(AzureEnvironment.AzureGermany);
        });
    });
});
