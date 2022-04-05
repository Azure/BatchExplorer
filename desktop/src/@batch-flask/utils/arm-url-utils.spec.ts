import { getSubscriptionIdFromUrl, urlFor } from "./arm-url-utils";

fdescribe("arm-url-utils", () => {
    describe("getSubscriptionIdFromUrl()", () => {
        it("should return a valid subscription ID", () => {
            expect(getSubscriptionIdFromUrl("/subscriptions/abc"))
                .toEqual(null);
            expect(getSubscriptionIdFromUrl(
                "/subscriptions/deadbeef-deadbeef-deadbeef-deadbeefa")
            ).toEqual("deadbeef-deadbeef-deadbeef-deadbeefa");
            expect(getSubscriptionIdFromUrl(
                "deadbeef-deadbeef-deadbeef-deadbeef-1")).toEqual(null);
            expect(getSubscriptionIdFromUrl({
                headers: null,
                method: "GET",
                url: "/subscriptions/abcdef0123456789abcdef0123456789abcdef0123456789"
            })).toEqual("abcdef0123456789abcdef0123456789abcdef0123456789");
        });
        it("should handle null values", () => {
            expect(getSubscriptionIdFromUrl(null)).toEqual(null);
            expect(getSubscriptionIdFromUrl({
                headers: null,
                method: "GET",
                url: null
            })).toEqual(null);
        });
    });
    describe("urlFor()", () => {
        it("should return a url for a string or Request", () => {
            expect(urlFor("foo")).toEqual("foo");
            expect(urlFor({ headers: null, method: "GET", url: "bar" }))
                .toEqual("bar");
        })
    });
});
