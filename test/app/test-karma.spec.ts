import { Account } from "app/models/account";

describe("Array KARMA", () => {
    describe("#indexOf()", () => {
        it("should return -1 when the value is not present", () => {
            expect([1, 2, 3].indexOf(4)).toEqual(-1);
        });
    });

    describe("#model()", () => {
        it("should be true", () => {
            const account = new Account("account-alias", "account-name");

            expect(account.alias).toEqual("account-alias");
            expect(account.name).toEqual("account-name");
            // expect(typeof AppComponent).to.equal("");
        });
    });
});
