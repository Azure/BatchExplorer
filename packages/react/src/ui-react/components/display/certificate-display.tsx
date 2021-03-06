import { Certificate } from "@batch/ui-service";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { ActionBar } from "../action/action-bar";
import { PropertyGroup } from "../property/property-group";
import { PropertyList } from "../property/property-list";
import { TextProperty } from "../property/text-property";

export interface CertificateDisplayProps {
    certificate?: Certificate;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = (
    props
) => {
    const [, setState] = React.useState();

    const certificate = props.certificate;
    if (!certificate) {
        return <div>No certificate found</div>;
    }

    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <ActionBar
                items={[
                    { text: "One" },
                    { text: "Two" },
                    {
                        text: "Throw a Test Error",
                        onClick: () => {
                            try {
                                throw new Error("Test error!");
                            } catch (e) {
                                setState(() => {
                                    throw e;
                                });
                            }
                        },
                    },
                ]}
            />
            <PropertyList>
                <PropertyGroup label="General">
                    <TextProperty
                        label="Thumbprint algorithm"
                        value={certificate.thumbprintAlgorithm}
                    />
                    <TextProperty
                        label="Thumbprint"
                        value={certificate.thumbprint}
                    />
                    <TextProperty label="URL" value={certificate.url} />
                    <TextProperty label="State" value={certificate.state} />
                </PropertyGroup>
            </PropertyList>
        </Stack>
    );
};
