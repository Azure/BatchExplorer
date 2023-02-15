import { createForm, getEnvironment } from "@batch/ui-common";
import { AbstractAction, Action } from "@batch/ui-common/lib/action";
import {
    Form,
    StringParameter,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { SubscriptionParameter } from "@batch/ui-react";
import { CreateAccountAction } from "@batch/ui-react/lib/account/create-account-action";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { EditorController } from "@batch/ui-react/lib/components/editor";
import { ActionForm } from "@batch/ui-react/lib/components/form";
import { Dropdown } from "@batch/ui-react/lib/components/form/dropdown";
import * as React from "react";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { DemoPane } from "../../layout/demo-pane";

type CarFormValues = {
    subscriptionId?: string;
    make?: string;
    model?: string;
    description?: string;
    milesPerChange?: number;
};

class CreateOrUpdateCarAction extends AbstractAction<CarFormValues> {
    async onInitialize(): Promise<CarFormValues> {
        return {
            milesPerChange: 300,
        };
    }

    buildForm(initialValues: CarFormValues): Form<CarFormValues> {
        const form = createForm<CarFormValues>({
            title: "Example Form",
            values: initialValues,
        });

        form.param("subscriptionId", SubscriptionParameter, {
            label: "Subscription",
        });

        const carSection = form.section("Car Info", {
            description: "Information about the car's make, model, etc.",
        });

        carSection.param("make", StringParameter, {
            label: "Make",
            description: "The brand of the vehicle",
            onValidateSync: (value) => {
                if (value === "foo") {
                    return new ValidationStatus(
                        "error",
                        "Make 'foo' isn't allowed"
                    );
                }
                return new ValidationStatus("ok");
            },
        });

        carSection.param("model", StringParameter, {
            label: "Model",
            dynamic: {
                hidden: (values) => (values.make ?? "") === "",
            },
        });

        carSection.param("description", StringParameter, {
            label: "Description",
            dynamic: {
                disabled: (values) => {
                    return (
                        (values.make ?? "") === "" ||
                        (values.model ?? "") === ""
                    );
                },
                placeholder: (values) => {
                    if (values.make && values.model) {
                        return `A brief description of your ${values.make} ${values.model}`;
                    } else {
                        return "Please enter a make and a model";
                    }
                },
            },
        });

        return form;
    }

    onValidateSync(): ValidationStatus {
        return new ValidationStatus("ok");
    }

    async onValidateAsync(): Promise<ValidationStatus> {
        return new ValidationStatus("ok");
    }

    async onExecute(formValues: CarFormValues): Promise<void> {
        getEnvironment()
            .getLogger()
            .info("Execute called with values:" + formValues);
    }
}

const actions: { [name: string]: () => Action } = {
    createAccount: () => new CreateAccountAction({}),
    createOrUpdateCar: () => new CreateOrUpdateCarAction(),
};

export const ActionFormDemo: React.FC = () => {
    const controllerRef = React.useRef<EditorController>();

    const [actionName, setActionName] = React.useState("createAccount");
    const [action, setAction] = React.useState(actions[actionName]());
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
                    action.isInitialized &&
                    JSON.stringify(action.form.values, undefined, 4) !==
                        textContent
                ) {
                    action.form.setValues(JSON.parse(textContent));
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
                <ActionForm action={action} onFormChange={formChangeHandler} />
            </DemoComponentContainer>

            <DemoControlContainer>
                <Dropdown
                    style={{ minWidth: "160px" }}
                    label="Action"
                    value={actionName}
                    options={[
                        {
                            label: "Create or Update Car",
                            value: "createOrUpdateCar",
                        },
                        { label: "Create Account", value: "createAccount" },
                    ]}
                    onChange={(_, value) => {
                        setActionName(value);
                        setAction(actions[actionName]());
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
                    value={
                        action.isInitialized
                            ? JSON.stringify(action.form.values)
                            : ""
                    }
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
