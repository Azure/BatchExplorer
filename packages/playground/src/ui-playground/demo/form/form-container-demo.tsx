import * as React from "react";
import { DemoPane } from "../../layout/demo-pane";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { createAccountForm } from "@batch/ui-react/lib/account/create-account";
import { createForm, Form } from "@batch/ui-common";
import { ParameterType } from "@batch/ui-react/lib/components/form/parameter-type";
import { FormContainer } from "@batch/ui-react/lib/components/form";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { EditorController } from "@batch/ui-react/lib/components/editor";
import { Dropdown } from "@batch/ui-react/lib/components/form/dropdown";

type ExampleFormValues = {
    subscriptionId?: string;
    make?: string;
    model?: string;
    description?: string;
    milesPerChange?: number;
};

const carForm = createForm<ExampleFormValues>({
    title: "Example Form",
    values: {
        make: "Tesla",
        model: "Model 3",
        milesPerChange: 300,
    },
});

carForm.param("subscriptionId", ParameterType.SubscriptionId, {
    label: "Subscription",
    value: "/fake/sub2",
});

const carSection = carForm.section("Car Info", {
    description: "Information about the car's make, model, etc.",
});

carSection.param("make", ParameterType.String, {
    label: "Make",
    description: "The brand of the vehicle",
});

carSection.param("model", ParameterType.String, {
    label: "Model",
    value: "Model Y",
});

carSection.param("description", ParameterType.String, {
    label: "Description",
});

export const FormContainerDemo: React.FC = () => {
    const controllerRef = React.useRef<EditorController>();

    const [form, setForm] = React.useState(createAccountForm);
    const [editorError, setEditorError] = React.useState<string>("");

    const formChangeHandler = React.useCallback(
        (newValues: ExampleFormValues) => {
            const newEditorContents = JSON.stringify(newValues, undefined, 4);
            if (
                editorError === "" &&
                controllerRef.current?.model.getValue() !== newEditorContents
            ) {
                controllerRef.current?.model.setValue(newEditorContents);
            }
        },
        [controllerRef, editorError]
    );

    const editorChangeHandler = React.useCallback(
        (textContent: string) => {
            try {
                if (JSON.stringify(form.values, undefined, 4) !== textContent) {
                    form.values = JSON.parse(textContent);
                }
                setEditorError("");
            } catch (e) {
                setEditorError("Invalid JSON");
            }
        },
        [form]
    );

    return (
        <DemoPane title="FormContainer">
            <DemoComponentContainer>
                <FormContainer form={form} onFormChange={formChangeHandler} />
            </DemoComponentContainer>

            <DemoControlContainer>
                <Dropdown
                    style={{ minWidth: "160px" }}
                    label="Form"
                    value={form}
                    options={[
                        // TODO: Rework the dropdown and/or form to remove any
                        //       requirement to cast to any unknown
                        { label: "Car Form", value: carForm as unknown },
                        { label: "Account Form", value: createAccountForm },
                    ]}
                    onChange={(value) => {
                        // TODO: Rework the dropdown and/or form to remove any
                        //       requirement to cast to any here
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setForm(value as Form<any>);
                    }}
                    valueToKey={(value) => {
                        if (value === carForm) {
                            return "carForm";
                        } else if (value === createAccountForm) {
                            return "accountForm";
                        }
                        throw new Error(`Unknown form in dropdown: ${value}`);
                    }}
                />
            </DemoControlContainer>

            <h3>Form values</h3>
            <div style={{ width: "100%", height: "20px" }}>{editorError}</div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                }}
            >
                <MonacoEditor
                    controllerRef={controllerRef}
                    value={JSON.stringify(form.values)}
                    onChange={editorChangeHandler}
                    onChangeDelay={20}
                    language="json"
                    containerStyle={{
                        width: "100%",
                        height: "100%",
                    }}
                    editorOptions={{
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
        </DemoPane>
    );
};
