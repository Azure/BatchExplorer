import { initMockEnvironment } from "../../environment";
import { ValidationSnapshot } from "../validation-snapshot";
import { ValidationStatus } from "../validation-status";

type FruitFormValues = {
    fruit?: string;
    color?: string;
};

describe("ValidationSnapshot tests", () => {
    let snapshot: ValidationSnapshot<FruitFormValues>;

    beforeEach(() => {
        initMockEnvironment();

        snapshot = new ValidationSnapshot({
            fruit: "banana",
            color: "yellow",
        });

        // Start out fully loaded and valid
        snapshot.onValidateSyncStatus = new ValidationStatus("ok");
        snapshot.onValidateAsyncStatus = new ValidationStatus("ok");
        snapshot.entryStatus.fruit = new ValidationStatus("ok");
        snapshot.entryStatus.color = new ValidationStatus("ok");
        snapshot.syncValidationComplete = true;
        snapshot.asyncValidationComplete = true;
    });

    test("Valid", () => {
        expect(snapshot.overallStatus).toBeUndefined();

        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("ok");
        expect(snapshot.overallStatus?.forced).toBe(false);
        expect(snapshot.overallStatus?.message).toBeUndefined();
    });

    test("Single parameter validation error", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("The fruit was rotten :(");
    });

    test("More than one parameter validation error", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.entryStatus.color = new ValidationStatus(
            "error",
            "And the color was brown"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("2 errors found");
    });

    test("Sync form validation status overrides parameter status", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.onValidateSyncStatus = new ValidationStatus(
            "error",
            "Sync validation wins"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("Sync validation wins");
    });

    test("Async form validation status overrides parameter status", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.onValidateAsyncStatus = new ValidationStatus(
            "error",
            "Async validation wins"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("Async validation wins");
    });

    test("Sync form validation status overrides async form validation status", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.onValidateSyncStatus = new ValidationStatus(
            "error",
            "Sync validation wins"
        );
        snapshot.onValidateAsyncStatus = new ValidationStatus(
            "error",
            "Async validation wins"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("Sync validation wins");
    });

    test("Form validation warnings override parameter warnings", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "warn",
            "The fruit was just ok"
        );
        snapshot.onValidateSyncStatus = new ValidationStatus(
            "warn",
            "Sync validation warning wins"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("warn");
        expect(snapshot.overallStatus?.message).toBe(
            "Sync validation warning wins"
        );
    });

    test("Form validation warnings do not override parameter errors", () => {
        snapshot.entryStatus.fruit = new ValidationStatus(
            "error",
            "The fruit was rotten :("
        );
        snapshot.onValidateSyncStatus = new ValidationStatus(
            "warn",
            "Sync validation warning is ignored"
        );
        snapshot.updateOverallStatus();

        expect(snapshot.overallStatus?.level).toBe("error");
        expect(snapshot.overallStatus?.message).toBe("The fruit was rotten :(");
    });
});
