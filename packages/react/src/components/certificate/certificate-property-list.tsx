import { CertificateView } from "@batch/ui-service";
import { observer } from "mobx-react-lite";
import * as React from "react";
import {
    ContentPane,
    DateProperty,
    PropertyGroup,
    PropertyList,
    TextProperty,
} from "@azure/bonito-ui/lib/components";

export interface CertificatePropertyListProps {
    view: CertificateView;
}

/**
 * Display each property of a single certificate in a key/value list
 */
export const CertificatePropertyList = observer(
    (props: CertificatePropertyListProps) => {
        if (!props.view.model) {
            return <ContentPane>No certificate to display</ContentPane>;
        }

        const cert = props.view.model;
        return (
            <PropertyList>
                <PropertyGroup title="General">
                    <TextProperty
                        label="Thumbprint algorithm"
                        value={cert.thumbprintAlgorithm}
                    />
                    <TextProperty label="Thumbprint" value={cert.thumbprint} />
                    <TextProperty label="URL" value={cert.url} />
                    <TextProperty label="State" value={cert.state} />
                    <DateProperty
                        label="State transition time"
                        value={cert.stateTransitionTime}
                    />
                    <TextProperty
                        label="Previous state"
                        value={cert.previousState}
                    />
                    <DateProperty
                        label="Previous transition time"
                        value={cert.previousStateTransitionTime}
                    />
                    <TextProperty label="Public data" value={cert.publicData} />
                </PropertyGroup>
            </PropertyList>
        );
    }
);
