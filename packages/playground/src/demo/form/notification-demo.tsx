import { DemoPane } from "../../layout/demo-pane";
import { DefaultButton } from "@fluentui/react/lib/Button";
import * as React from "react";
import { Notification } from "@azure/bonito-core/lib/notification";
import { DependencyName } from "@azure/bonito-core";
import { inject } from "@azure/bonito-core/lib/environment";

export const NotificationDemo: React.FC = () => {
    const notifier = inject<Notification>(DependencyName.Notifier);

    return (
        <DemoPane title="Notification">
            <div style={{ display: "flex" }}>
                <DefaultButton
                    text="info"
                    onClick={() => notifier.info("Info", "Potato")}
                />
            </div>
            <br></br>
            <div style={{ display: "flex" }}>
                <DefaultButton
                    text="warning"
                    onClick={() => notifier.warn("Warn", "Potato on fire")}
                />
            </div>
            <br></br>
            <div style={{ display: "flex" }}>
                <DefaultButton
                    text="in progress"
                    onClick={() => {
                        const pendingNotification = notifier.inProgress(
                            "In Progress",
                            "Harvesting potatoes ..."
                        );
                        setTimeout(
                            () => {
                                pendingNotification.update(
                                    "Still pending",
                                    "Potatoes are flying through your walls ..."
                                );
                                setTimeout(
                                    () =>
                                        pendingNotification.complete(
                                            "success",
                                            "Complete",
                                            "Potatoes are harvested"
                                        ),
                                    5 * 1000 // in miliseconds
                                );
                            },
                            20 * 1000 // in miliseconds
                        );
                    }}
                />
            </div>
            <br></br>
            <div style={{ display: "flex" }}>
                <DefaultButton
                    text="success"
                    onClick={() =>
                        notifier.success("Success", "Potato is harvested")
                    }
                />
            </div>
            <br></br>
            <div style={{ display: "flex" }}>
                <DefaultButton
                    text="error"
                    onClick={() =>
                        notifier.error("Error", "Potato could not be found")
                    }
                />
            </div>
        </DemoPane>
    );
};
