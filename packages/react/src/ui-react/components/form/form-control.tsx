import * as React from "react";
import { FormParameter, FormParameterInit } from "@batch/ui-common/lib/form";

export interface FormControlProps {
    parameter: FormParameter | FormParameterInit;
}

export const FormControl: React.FC<FormControlProps> = (props) => {
    return (
        <div>Form control placeholder for parameter {props.parameter.id}</div>
    );
};
