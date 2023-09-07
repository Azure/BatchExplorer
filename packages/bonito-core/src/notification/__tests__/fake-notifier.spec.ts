import { initMockEnvironment } from "../../environment";
import { FakeNotifier } from "../fake-notifier";

describe("Fake notification tests", () => {
    let notifier: FakeNotifier;

    beforeEach(() => {
        initMockEnvironment();
        notifier = new FakeNotifier();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Each notifier function works as expected", () => {
        notifier.expectInfo("Info Notification : This is an info", {});
        notifier.info("Info Notification", "This is an info");

        notifier.expectWarn("Warn Notification : This is a warning", {});
        notifier.warn("Warn Notification", "This is a warning");

        notifier.expectInProgress(
            "In Progress Notification : Action in progress",
            {}
        );
        notifier.inProgress("In Progress Notification", "Action in progress");

        notifier.expectSuccess("Success Notification : This is a success", {});
        notifier.success("Success Notification", "This is a success");

        notifier.expectError("Error Notification : This is an error", {});
        notifier.error("Error Notification", "This is an error");
    });
});
