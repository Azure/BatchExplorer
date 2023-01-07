import { CertificateView } from "@batch/ui-service";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { ActionBar } from "../action/action-bar";
import { CertificatePropertyList } from "./certificate-property-list";
import { ContentPane, TabContainer, Tab } from "../layout";
import { ProgressIndicator } from "@fluentui/react/lib/ProgressIndicator";
import { Spinner } from "@fluentui/react/lib/Spinner";

export interface CertificateDisplayProps {
    view?: CertificateView;
}

export const CertificateDisplay = observer((props: CertificateDisplayProps) => {
    if (!props.view || !props.view.model) {
        return <ContentPane>No certificate to display</ContentPane>;
    }

    const { view } = props;

    const isDeleteing = view.model?.state === "deleting";
    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <ActionBar
                // TODO: Get actions from data
                items={[
                    {
                        text: "Refresh",
                        icon: { iconName: "Refresh" },
                        onClick: () => {
                            view?.refresh();
                        },
                        disabled: view?.isRefreshing,
                        commandBarButtonAs: view?.isRefreshing
                            ? () => {
                                  return (
                                      <Spinner
                                          label="refreshing"
                                          labelPosition="right"
                                      />
                                  );
                              }
                            : undefined,
                    },
                    {
                        text: "Delete",
                        icon: { iconName: "Delete" },
                        onClick: () => {
                            view?.delete();
                        },
                        disabled: isDeleteing,
                    },
                    {
                        text: "Reactivate",
                        icon: { iconName: "Redo" },
                        onClick: () => {
                            view?.reactivate();
                        },
                        disabled: view.model?.state !== "deletefailed",
                    },
                    {
                        text: "Export as JSON",
                        icon: { iconName: "Download" },
                        onClick: () => {
                            view?.exportToJson();
                        },
                    },
                ]}
            />
            {isDeleteing ? (
                <ProgressIndicator
                    styles={{ root: { "padding-inline": "12px" } }}
                    label="Deleting"
                />
            ) : null}
            <TabContainer>
                <Tab name="Configuration">
                    <CertificatePropertyList view={view} />
                </Tab>
            </TabContainer>
        </Stack>
    );
});
