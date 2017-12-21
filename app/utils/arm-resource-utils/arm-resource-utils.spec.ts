import { ArmResourceUtils } from "app/utils";

const prefix = "/subscriptions/sub-123/resourcegroups/rg-123";
const resource1 = `${prefix}/providers/pro123/type123/res123`;
const resource2 = `${prefix}/providers/Microsoft.Batch/batchAccounts/account-1`;
const invalidResource = `${prefix}/Microsoft.Batch/batchAccounts/account-1/list`;

describe("ArmResourceUtils", () => {
    describe("#isResourceId()", () => {
        it("returns true with valid resource", () => {
            expect(ArmResourceUtils.isResourceId(resource1)).toBe(true);
            expect(ArmResourceUtils.isResourceId(resource2)).toBe(true);
        });

        it("returns false with invalid resource", () => {
            expect(ArmResourceUtils.isResourceId(invalidResource)).toBe(false);
            expect(ArmResourceUtils.isResourceId(null)).toBe(false);
            expect(ArmResourceUtils.isResourceId(undefined)).toBe(false);
            expect(ArmResourceUtils.isResourceId("1234-5678")).toBe(false);
            expect(ArmResourceUtils.isResourceId("invalid/resource/id")).toBe(false);
        });
    });

    describe("#getSubscriptionIdFromResourceId()", () => {
        it("returns the subscription with valid resource", () => {
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId(resource1)).toEqual("sub-123");
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId(resource2)).toEqual("sub-123");
        });

        it("returns null with invalid resource", () => {
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId(null)).toBe(null);
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId(undefined)).toBe(null);
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId("1234-5678")).toBe(null);
            expect(ArmResourceUtils.getSubscriptionIdFromResourceId("invalid/resource/id")).toBe(null);
        });
    });

    describe("#getAccountNameFromResourceId()", () => {
        it("returns the subscription with valid resource", () => {
            expect(ArmResourceUtils.getAccountNameFromResourceId(resource1)).toEqual("res123");
            expect(ArmResourceUtils.getAccountNameFromResourceId(resource2)).toEqual("account-1");
        });

        it("returns null with invalid resource", () => {
            expect(ArmResourceUtils.getAccountNameFromResourceId(invalidResource)).toBe(null);
            expect(ArmResourceUtils.getAccountNameFromResourceId(null)).toBe(null);
            expect(ArmResourceUtils.getAccountNameFromResourceId(undefined)).toBe(null);
            expect(ArmResourceUtils.getAccountNameFromResourceId("1234-5678")).toBe(null);
            expect(ArmResourceUtils.getAccountNameFromResourceId("invalid/resource/id")).toBe(null);
        });
    });
});
