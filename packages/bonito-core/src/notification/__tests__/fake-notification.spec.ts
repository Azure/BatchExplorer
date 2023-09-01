import { initMockEnvironment } from "../../environment";
import { FakeNotification } from "../fake-notification";

describe("Fake notification tests", () => {
    let notification: FakeNotification;

    beforeEach(() => {
        initMockEnvironment();
        notification = new FakeNotification();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Each notification function works as expected", () => {
        notification.expectInfo("Info Notification : This is an info", {});
        notification.info("Info Notification", "This is an info");

        notification.expectWarn("Warn Notification : This is a warning", {});
        notification.warn("Warn Notification", "This is a warning");

        notification.expectInProgress(
            "In Progress Notification : Action in progress",
            {}
        );
        notification.inProgress(
            "In Progress Notification",
            "Action in progress"
        );

        notification.expectSuccess(
            "Success Notification : This is a success",
            {}
        );
        notification.success("Success Notification", "This is a success");

        notification.expectError("Error Notification : This is an error", {});
        notification.error("Error Notification", "This is an error");
    });
});
