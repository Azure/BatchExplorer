import * as React from "react";
import { DemoPane } from "../../layout/demo-pane";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { CreateAccountAction } from "@batch/ui-react/lib/account/create-account-action";
import { createForm, Form, getEnvironment } from "@batch/ui-common";
import { ParameterType } from "@batch/ui-react/lib/components/form/parameter-type";
import { ActionForm } from "@batch/ui-react/lib/components/form";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { EditorController } from "@batch/ui-react/lib/components/editor";
import { Dropdown } from "@batch/ui-react/lib/components/form/dropdown";
import { AbstractAction, Action } from "@batch/ui-common/lib/action";
import { FormValues } from "@batch/ui-common/lib/form";

type CarFormValues = {
    subscriptionId?: string;
    make?: string;
    model?: string;
    description?: string;
    milesPerChange?: number;
};

class CreateOrUpdateCarAction extends AbstractAction<CarFormValues> {
    buildForm(initialValues: CarFormValues): Form<CarFormValues> {
        const form = createForm<CarFormValues>({
            title: "Example Form",
            values: initialValues,
        });

        form.param("subscriptionId", ParameterType.SubscriptionId, {
            label: "Subscription",
            value: "/fake/sub2",
        });

        const carSection = form.section("Car Info", {
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

        return form;
    }

    async onValidate(): Promise<void> {
        // no-op
    }

    async execute(formValues: CarFormValues): Promise<void> {
        getEnvironment()
            .getLogger()
            .info("Execute called with values:" + formValues);
    }
}

const actions: { [name: string]: Action<FormValues> } = {
    createAccount: new CreateAccountAction({}),
    createOrUpdateCar: new CreateOrUpdateCarAction({
        make: "Tesla",
        model: "Model 3",
        milesPerChange: 300,
    }),
};

export const ActionFormDemo: React.FC = () => {
    const controllerRef = React.useRef<EditorController>();

    const [action, setAction] = React.useState("createAccount");
    const [editorError, setEditorError] = React.useState<string>("");

    const formChangeHandler = React.useCallback(
        (newValues: CarFormValues) => {
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
                if (
                    JSON.stringify(
                        actions[action].form.values,
                        undefined,
                        4
                    ) !== textContent
                ) {
                    actions[action].form.values = JSON.parse(textContent);
                }
                setEditorError("");
            } catch (e) {
                setEditorError("Invalid JSON");
            }
        },
        [action]
    );

    return (
        <DemoPane title="ActionForm">
            <DemoComponentContainer>
                <ActionForm
                    action={actions[action]}
                    onFormChange={formChangeHandler}
                />
            </DemoComponentContainer>

            <DemoControlContainer>
                <Dropdown
                    style={{ minWidth: "160px" }}
                    label="Action"
                    value={action}
                    options={[
                        {
                            label: "Create or Update Car",
                            value: "createOrUpdateCar",
                        },
                        { label: "Create Account", value: "createAccount" },
                    ]}
                    onChange={(value) => {
                        setAction(value);
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
                    value={JSON.stringify(actions[action].form.values)}
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
