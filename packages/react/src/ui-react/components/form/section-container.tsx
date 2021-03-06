import * as React from "react";
import { FormSection, FormSectionInit } from "@batch/ui-common/lib/form";

export interface SectionContainerProps {
    section: FormSection | FormSectionInit;
}

export const SectionContainer: React.FC<SectionContainerProps> = (props) => {
    return (
        <div>
            <h2>Section container for section {props.section.id}</h2>
            {props.children}
        </div>
    );
};
