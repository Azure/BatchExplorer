import { CertificateView } from "@batch/ui-service";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { PropertyGroup } from "../property/property-group";
import { PropertyList } from "../property/property-list";
import { TextProperty } from "../property/text-property";
import { ContentPane } from "../layout";

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
                <PropertyGroup label="General">
                    <TextProperty
                        label="Thumbprint algorithm"
                        value={cert.thumbprintAlgorithm}
                    />
                    <TextProperty label="Thumbprint" value={cert.thumbprint} />
                    <TextProperty label="URL" value={cert.url} />
                    <TextProperty label="State" value={cert.state} />
                </PropertyGroup>
            </PropertyList>
        );
    }
);
