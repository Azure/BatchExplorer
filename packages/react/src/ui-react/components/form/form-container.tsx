import * as React from "react";
import { Form, FormInit } from "@batch/ui-common/lib/form";

export interface FormContainerProps {
    form: Form | FormInit;
}

export const FormContainer: React.FC<FormContainerProps> = (props) => {
    return (
        <div>
            <h2>Form container for form {props.form.id}</h2>
            {props.children}
        </div>
    );
};
