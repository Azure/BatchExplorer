import { BasicFakeSet } from "../fakes";

describe("Fake data sets", () => {
    const basicFakeSet = new BasicFakeSet();

    test("List subscriptions by tenant ID", () => {
        // Short ID
        expect(
            basicFakeSet
                .listSubscriptionsByTenant(
                    "99999999-9999-9999-9999-999999999999"
                )
                .map((value) => value.displayName)
        ).toEqual(["tanuki", "nekomata"]);

        // ARM Resource ID
        expect(
            basicFakeSet
                .listSubscriptionsByTenant(
                    "/tenants/99999999-9999-9999-9999-999999999999"
                )
                .map((value) => value.displayName)
        ).toEqual(["tanuki", "nekomata"]);

        // No data
        expect(basicFakeSet.listSubscriptionsByTenant("doesntexist")).toEqual(
            []
        );
    });

    test("List locations by sub ID", () => {
        // Short ID
        expect(
            basicFakeSet
                .listLocationsBySubscription(
                    "00000000-0000-0000-0000-000000000000"
                )
                .map((value) => value.name)
        ).toEqual(["eastus", "southcentralus"]);

        // ARM Resource ID
        expect(
            basicFakeSet
                .listLocationsBySubscription(
                    "/subscriptions/00000000-0000-0000-0000-000000000000"
                )
                .map((value) => value.name)
        ).toEqual(["eastus", "southcentralus"]);

        // No data
        expect(basicFakeSet.listLocationsBySubscription("doesntexist")).toEqual(
            []
        );
    });

    test("List resource groups by sub ID", () => {
        // Short ID
        expect(
            basicFakeSet
                .listResourceGroupsBySubscription(
                    "00000000-0000-0000-0000-000000000000"
                )
                .map((value) => value.name)
        ).toEqual(["supercomputing", "visualization"]);

        // ARM Resource ID
        expect(
            basicFakeSet
                .listResourceGroupsBySubscription(
                    "/subscriptions/00000000-0000-0000-0000-000000000000"
                )
                .map((value) => value.name)
        ).toEqual(["supercomputing", "visualization"]);

        // No data
        expect(
            basicFakeSet.listResourceGroupsBySubscription("doesntexist")
        ).toEqual([]);
    });
});
