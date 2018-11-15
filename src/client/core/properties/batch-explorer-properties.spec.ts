import { InMemoryDataStore } from "@batch-flask/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { Constants } from "common";
import * as proxyquire from "proxyquire";
import { Subscription } from "rxjs";
import { BatchExplorerProperties } from "./batch-explorer-properties";

describe("BatchExplorerProperties", () => {
    let store: InMemoryDataStore;
    let properties: BatchExplorerProperties;
    let envFromObs: AzureEnvironment | null;
    let isInvertedColorScheme;
    let invertedColorChangeCallback: () => void;

    beforeEach(() => {
        isInvertedColorScheme = false;
        envFromObs = null;
        store = new InMemoryDataStore();

        const { BatchExplorerProperties } = proxyquire("./batch-explorer-properties", {
            electron: {
                systemPreferences: {
                    isInvertedColorScheme: () => isInvertedColorScheme,
                    on: (name: string, x) => invertedColorChangeCallback = x,
                },
            },
        });

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

    describe("High contrast", () => {

        let isHighContrast: boolean;
        let highContrastSub: Subscription;

        beforeEach(() => {
            highContrastSub = properties.isOSHighContrast.subscribe((x) => {
                isHighContrast = x;
            });
        });

        afterEach(() => {
            highContrastSub.unsubscribe();
        });

        it("it not high contrast by default", () => {
            expect(isHighContrast).toBe(false);
        });

        it("listen to system even if theme change", () => {
            expect(isHighContrast).toBe(false);

            isInvertedColorScheme = true;
            invertedColorChangeCallback();
            expect(isHighContrast).toBe(true);
        });
    });
});
