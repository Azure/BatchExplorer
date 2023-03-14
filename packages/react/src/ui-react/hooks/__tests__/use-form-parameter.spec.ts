import { createForm, delay } from "@batch/ui-common";
import {
    AbstractParameter,
    FormValues,
    NumberParameter,
    ParameterDependencies,
    ParameterName,
    StringParameter,
} from "@batch/ui-common/lib/form";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useCallback } from "react";
import { initMockBrowserEnvironment } from "../../environment";
import { useFormParameter } from "../use-form-parameter";

type BeverageFormValues = {
    orderNumber: number;
    temperature?: string;
    beverageName?: string;
};

const beverageTestData: Beverage[] = [
    { name: "hot tea", temperature: "hot" },
    { name: "coffee", temperature: "hot" },
    { name: "iced tea", temperature: "cold" },
    { name: "iced latte", temperature: "cold" },
];

class BeverageParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends BeverageDependencies<V>
> extends AbstractParameter<V, K, D> {
    beverageLoadError: string | undefined = undefined;

    async loadBeverages(): Promise<Beverage[]> {
        const temp = this.getTemperature();
        let beverages: Beverage[] = [];
        if (temp) {
            try {
                // Alphabetically sorted beverage names
                beverages = await listBeverages(temp);
                this.beverageLoadError = undefined;
            } catch (e) {
                this.beverageLoadError =
                    e instanceof Error ? e.message : String(e);
            }
        }
        return beverages;
    }

    getTemperature(): string | undefined {
        return this.getDependencyValueAsString("temperature");
    }
}

describe("useFormParameter hook", () => {
    const form = createForm<BeverageFormValues>({
        values: {
            orderNumber: 1,
        },
    });
    const orderNumParam = form.param("orderNumber", NumberParameter);
    const tempParam = form.param("temperature", StringParameter);
    const beverageParam = form.param("beverageName", BeverageParameter, {
        dependencies: {
            temperature: "temperature",
        },
    });

    beforeEach(() => initMockBrowserEnvironment());

    test("Form parameter with dependencies and data loading", async () => {
        // let value = "foo";
        // let counter = 1;
        // let callCount = 0;
        let loadCount = 0;

        const { result, waitForNextUpdate } = renderHook(() => {
            const loadData = useCallback(async () => {
                loadCount++;
                const beverages = await beverageParam.loadBeverages();
                return beverages.map((value) => value.name).sort();
            }, []);

            return useFormParameter(beverageParam, {
                loadData: loadData,
            });
        });

        // Initial data started loading
        expect(loadCount).toBe(1);
        expect(result.current.data).toBeUndefined();

        await waitForNextUpdate();
        await result.current.loadingPromise;

        // Initial data finished loading
        expect(result.current.data).toEqual([]);
        expect(result.current.loading).toBe(false);

        // Changing a dependency triggers a 2nd data load
        act(() => {
            tempParam.value = "hot";
        });
        expect(result.current.loading).toBe(true);

        await waitForNextUpdate();
        await result.current.loadingPromise;

        // 2nd data load finished
        expect(loadCount).toBe(2);
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(["coffee", "hot tea"]);

        // Changing a parameter that's not a dependency doesn't trigger loading
        act(() => {
            orderNumParam.value = orderNumParam.value++;
        });
        expect(result.current.loading).toBe(false);

        // Change the dependency again
        act(() => {
            tempParam.value = "cold";
        });

        await waitForNextUpdate();
        await result.current.loadingPromise;

        // Dropdown has updated
        expect(loadCount).toBe(3);
        expect(result.current.data).toEqual(["iced latte", "iced tea"]);
    });
});

type Beverage = { name: string; temperature: string };

type BeverageDependencies<V extends FormValues> = ParameterDependencies<
    V,
    "temperature"
>;

async function listBeverages(temperature: string): Promise<Beverage[]> {
    await delay();
    if (temperature !== "hot" && temperature !== "cold") {
        throw new Error("Invalid temperature: " + temperature);
    }
    const data = beverageTestData.filter(
        (value) => value.temperature === temperature
    );
    return data;
}
