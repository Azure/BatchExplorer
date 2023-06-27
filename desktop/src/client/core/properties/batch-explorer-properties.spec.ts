import { InMemoryDataStore } from "@batch-flask/core";
import { AzureChina, AzureEnvironment, AzureGermany, AzurePublic } from "client/azure-environment";
import { Constants } from "common";
import * as proxyquire from "proxyquire";
import { Subscription } from "rxjs";
import { BatchExplorerProperties } from "./batch-explorer-properties";

interface MockRequires {
    electron: {
        nativeTheme: {
            on: (event: string, x: () => void) => void,
            shouldUseInvertedColorScheme: boolean,
        },
    };
}

describe("BatchExplorerProperties", () => {
    let store: InMemoryDataStore;
    let properties: BatchExplorerProperties;
    let envFromObs: AzureEnvironment | null;
    let azureEnvironmentServiceSpy;
    let invertedColorChangeCallback: () => void;
    let mockRequires: MockRequires;

    beforeEach(() => {
        envFromObs = null;
        store = new InMemoryDataStore();

        mockRequires = {
            electron: {
                nativeTheme: {
                    on: (event: string, x) => {
                        if (event === "updated") {
                            invertedColorChangeCallback = x;
                        }
                    },
                    shouldUseInvertedColorScheme: false,
                },
            },
        };

        const { BatchExplorerProperties } = proxyquire("./batch-explorer-properties", mockRequires);

        azureEnvironmentServiceSpy = {
            get: () => Promise.resolve(AzureChina),
        };

        properties = new BatchExplorerProperties(store, azureEnvironmentServiceSpy);
        properties.azureEnvironmentObs.subscribe(x => envFromObs = x);
    });

    describe("azureEnvironment", () => {
        it("default to public cloud if not set", async () => {
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzurePublic);

            expect(envFromObs).toBe(AzurePublic);
        });

        it("loads the environment from the store", async () => {
            await store.setItem(Constants.localStorageKey.azureEnvironment, AzureChina.id);
            await properties.init();
            expect(properties.azureEnvironment).toBe(AzureChina);

            expect(envFromObs).toBe(AzureChina);
        });

        it("updates the enviromnent in the store", async () => {
            await properties.init();
            await properties.updateAzureEnvironment(AzureGermany);
            expect(properties.azureEnvironment).toBe(AzureGermany);

            expect(envFromObs).toBe(AzureGermany);

            const id = await store.getItem(Constants.localStorageKey.azureEnvironment);
            expect(id).toBe(AzureGermany.id);
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

            mockRequires.electron.nativeTheme.shouldUseInvertedColorScheme = true;
            invertedColorChangeCallback();
            expect(isHighContrast).toBe(true);
        });
    });
});
