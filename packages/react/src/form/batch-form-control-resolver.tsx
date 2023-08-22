import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import {
    DefaultFormControlResolver,
    FormControlProps,
} from "@azure/bonito-ui/lib/components/form";
import * as React from "react";
import { NodeCommsDropdown, NodeCommsParameter } from "../pool";
import {
    AccessRuleRadioButtons,
    AccessRuleRadioButtonsParamter,
} from "../networking";

export class BatchFormControlResolver extends DefaultFormControlResolver {
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(props: FormControlProps<V, K, D>): JSX.Element {
        const { param, id, onChange } = props;

        if (param instanceof NodeCommsParameter) {
            return (
                <NodeCommsDropdown
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        } else if (param instanceof AccessRuleRadioButtonsParamter) {
            return (
                <AccessRuleRadioButtons
                    id={id}
                    key={param.name}
                    param={param}
                    onChange={onChange}
                />
            );
        }

        return super.getFormControl(props);
    }
}
