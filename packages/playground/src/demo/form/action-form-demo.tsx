import { AbstractAction, Action } from "@azure/bonito-core/lib/action";
import {
    Form,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import {
    createParam,
    createReactForm,
    SubscriptionParameter,
} from "@azure/bonito-ui";
import { CreateAccountAction } from "@batch/ui-react/lib/account/create-account-action";
import {
    EditorController,
    MonacoEditor,
} from "@azure/bonito-ui/lib/components";
import { UpdateNodeCommsAction } from "@batch/ui-react/lib/pool";
import * as React from "react";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { DemoPane } from "../../layout/demo-pane";
import { ActionForm, Dropdown } from "@azure/bonito-ui/lib/components/form";
import { UpdateAccessRulesAction } from "@batch/ui-react/lib/networking";

type CarFormValues = {
    subscriptionId?: string;
    make?: string;
    model?: string;
    description?: string;
    milesPerChange?: number;
};

class CreateOrUpdateCarAction extends AbstractAction<CarFormValues> {
    actionName = "CreateOrUpdateCar";

    async onInitialize(): Promise<CarFormValues> {
        return {
            milesPerChange: 300,
        };
    }

    buildForm(initialValues: CarFormValues): Form<CarFormValues> {
        const form = createReactForm<CarFormValues>({
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

        form.item("summary", {
            dynamic: {
                hidden: (values) => values.make == null || values.model == null,
            },
            render: (props) => {
                const { values } = props;
                return (
                    <>
                        <h2>Summary:</h2>
                        <span>
                            Your car is a {values.make} {values.model}
                        </span>
                    </>
                );
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
        this.logger.info("Execute called with values:" + formValues);
    }
}

const actions: { [name: string]: () => Action } = {
    createAccount: () => new CreateAccountAction({}),
    createOrUpdateCar: () => new CreateOrUpdateCarAction(),
    updateNodeComms: () =>
        new UpdateNodeCommsAction(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo",
            "hobopool1"
        ),
    updateAccessRules: () =>
        new UpdateAccessRulesAction(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo"
        ),
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
                    param={createParam(StringParameter, {
                        label: "Action",
                        value: actionName,
                    })}
                    style={{ minWidth: "320px" }}
                    options={[
                        {
                            label: "Create or update car",
                            value: "createOrUpdateCar",
                        },
                        { label: "Create account", value: "createAccount" },
                        {
                            label: "Update pool node communication mode",
                            value: "updateNodeComms",
                        },
                        {
                            label: "Update network access rules",
                            value: "updateAccessRules",
                        },
                    ]}
                    onChange={(_, value) => {
                        const name = value ?? "";
                        setActionName(name);
                        setAction(actions[name]());
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
                            ? JSON.stringify(action.form.values, undefined, 4)
                            : "Initializing action..."
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
