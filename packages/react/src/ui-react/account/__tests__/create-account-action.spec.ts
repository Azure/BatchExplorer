import { CreateAccountAction } from "../create-account-action";

describe("Create account action", () => {
    test("Minimal account", async () => {
        const action = new CreateAccountAction({
            accountName: "one", // This name is already in use
            subscriptionId: "1234",
            resourceGroupId: "testrg",
            location: "fakeregion",
        });

        const form = action.form;
        expect(form.values.accountName).toEqual("one");
        expect(form.values.subscriptionId).toEqual("1234");
        expect(form.values.resourceGroupId).toEqual("testrg");
        expect(form.values.location).toEqual("fakeregion");

        // Validation has not been performed.
        expect(form.validationStatus).toBeUndefined();

        await action.validate();

        // Account name is already in use
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.entryValidationStatus.accountName?.level).toEqual("error");
        expect(form.entryValidationStatus.accountName?.message).toEqual(
            "An account named one already exists"
        );

        // Fix the account name issue and rerun validation
        form.values.accountName = "myaccount";

        await action.validate();

        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.entryValidationStatus.accountName?.level).toEqual("ok");
        expect(form.entryValidationStatus.accountName?.message).toEqual(
            "Validation passed"
        );
    });
});
