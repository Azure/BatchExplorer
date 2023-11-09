import {
    ActionBar,
    ContentPane,
    Tab,
    TabContainer,
} from "@azure/bonito-ui/lib/components";
import { CertificateView } from "@batch/ui-service";
import { Stack } from "@fluentui/react/lib/Stack";
import { observer } from "mobx-react-lite";
import * as React from "react";
import { CertificatePropertyList } from "./certificate-property-list";

export interface CertificateDisplayProps {
    view?: CertificateView;
}

export const CertificateDisplay = observer((props: CertificateDisplayProps) => {
    if (!props.view || !props.view.model) {
        return <ContentPane>No certificate to display</ContentPane>;
    }

    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <ActionBar
                // TODO: Get actions from data
                items={[
                    { text: "Refresh", icon: { iconName: "Refresh" } },
                    { text: "Delete", icon: { iconName: "Delete" } },
                    { text: "Reactivate", icon: { iconName: "Redo" } },
                    {
                        text: "Export as JSON",
                        icon: { iconName: "Download" },
                    },
                ]}
            />
            <TabContainer>
                <Tab name="Configuration">
                    <CertificatePropertyList view={props.view} />
                </Tab>
            </TabContainer>
        </Stack>
    );
});
