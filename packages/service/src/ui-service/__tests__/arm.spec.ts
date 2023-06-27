import {
    isValidSubscriptionId,
    isValidSubscriptionResourceId,
    isValidTenantId,
    isValidTenantResourceId,
    normalizeSubscriptionId,
    normalizeSubscriptionResourceId,
    normalizeTenantId,
    normalizeTenantResourceId,
} from "../arm";

describe("ARM utility tests", () => {
    test("isValidSubscriptionResourceId", () => {
        // Valid
        expect(
            isValidSubscriptionResourceId(
                "/subscriptions/99999a99-99b9-9999-9999-999999999999"
            )
        ).toBe(true);

        // Invalid character(s)
        expect(
            isValidSubscriptionResourceId(
                "/subscriptions/!9999!99-9999-9999-9999-999999999999"
            )
        ).toBe(false);

        // Valid prefix, missing ID
        expect(isValidSubscriptionResourceId("/subscriptions/")).toBe(false);

        // Doesn't start with /subscriptions
        expect(
            isValidSubscriptionResourceId(
                "99999999-9999-9999-9999-999999999999"
            )
        ).toBe(false);
        expect(
            isValidSubscriptionResourceId(
                "/foo/99999999-9999-9999-9999-999999999999"
            )
        ).toBe(false);
    });

    test("isValidSubscriptionId", () => {
        // Valid
        expect(
            isValidSubscriptionId("99999a99-99b9-9999-9999-999999999999")
        ).toBe(true);

        // Invalid character(s)
        expect(
            isValidSubscriptionId("99!99a99-99b9-9999-9999-9999999!9999")
        ).toBe(false);

        // Is an ARM ID
        expect(
            isValidSubscriptionId(
                "/subscriptions/99999a99-99b9-9999-9999-999999999999"
            )
        ).toBe(false);
    });

    test("normalizeSubscriptionResourceId", () => {
        expect(
            normalizeSubscriptionResourceId(
                "99999999-9999-9999-9999-999999999999"
            )
        ).toEqual("/subscriptions/99999999-9999-9999-9999-999999999999");
        expect(
            normalizeSubscriptionResourceId(
                "/subscriptions/99999999-9999-9999-9999-999999999999"
            )
        ).toEqual("/subscriptions/99999999-9999-9999-9999-999999999999");
        expect(() => normalizeSubscriptionResourceId("badid!")).toThrowError(
            `Invalid subscription ID: "badid!"`
        );
    });

    test("normalizeSubscriptionId", () => {
        expect(
            normalizeSubscriptionId("99999999-9999-9999-9999-999999999999")
        ).toEqual("99999999-9999-9999-9999-999999999999");
        expect(
            normalizeSubscriptionId(
                "/subscriptions/99999999-9999-9999-9999-999999999999"
            )
        ).toEqual("99999999-9999-9999-9999-999999999999");
        expect(() => normalizeSubscriptionId("badid!")).toThrowError(
            `Invalid subscription ID: "badid!"`
        );
    });

    test("isValidTenantResourceId", () => {
        // Valid
        expect(
            isValidTenantResourceId(
                "/tenants/99999a99-99b9-9999-9999-999999999999"
            )
        ).toBe(true);

        // Invalid character(s)
        expect(
            isValidTenantResourceId(
                "/tenants/!9999!99-9999-9999-9999-999999999999"
            )
        ).toBe(false);

        // Valid prefix, missing ID
        expect(isValidTenantResourceId("/tenants/")).toBe(false);

        // Doesn't start with /tenants
        expect(
            isValidTenantResourceId("99999999-9999-9999-9999-999999999999")
        ).toBe(false);
        expect(
            isValidTenantResourceId("/foo/99999999-9999-9999-9999-999999999999")
        ).toBe(false);
    });

    test("isValidTenantId", () => {
        // Valid
        expect(isValidTenantId("99999a99-99b9-9999-9999-999999999999")).toBe(
            true
        );

        // Invalid character(s)
        expect(isValidTenantId("99!99a99-99b9-9999-9999-9999999!9999")).toBe(
            false
        );

        // Is an ARM ID
        expect(
            isValidTenantId("/tenants/99999a99-99b9-9999-9999-999999999999")
        ).toBe(false);
    });

    test("normalizeTenantResourceId", () => {
        expect(
            normalizeTenantResourceId("99999999-9999-9999-9999-999999999999")
        ).toEqual("/tenants/99999999-9999-9999-9999-999999999999");
        expect(
            normalizeTenantResourceId(
                "/tenants/99999999-9999-9999-9999-999999999999"
            )
        ).toEqual("/tenants/99999999-9999-9999-9999-999999999999");
        expect(() => normalizeTenantResourceId("badid!")).toThrowError(
            `Invalid tenant ID: "badid!"`
        );
    });

    test("normalizeTenantId", () => {
        expect(
            normalizeTenantId("99999999-9999-9999-9999-999999999999")
        ).toEqual("99999999-9999-9999-9999-999999999999");
        expect(
            normalizeTenantId("/tenants/99999999-9999-9999-9999-999999999999")
        ).toEqual("99999999-9999-9999-9999-999999999999");
        expect(() => normalizeTenantId("badid!")).toThrowError(
            `Invalid tenant ID: "badid!"`
        );
    });
});
