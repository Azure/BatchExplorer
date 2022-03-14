import * as React from "react";
import { DemoPane } from "../../layout/demo-pane";
import { DemoComponentContainer } from "../../layout/demo-component-container";
import { DemoControlContainer } from "../../layout/demo-control-container";
import { createForm } from "@batch/ui-common";
import { ParameterType } from "@batch/ui-react/lib/components/form/parameter-type";
import { FormContainer } from "@batch/ui-react/lib/components/form";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { EditorController } from "@batch/ui-react/lib/components/editor";

type ExampleFormValues = {
    subscriptionId?: string;
    make?: string;
    model?: string;
    description?: string;
    milesPerChange?: number;

    // TODO: Can we not require sections to be specified here, but still
    //       prevent naming collisions at compile time?
    carInfoSection?: never;
};

const form = createForm<ExampleFormValues>({
    title: "Example Form",
    values: {
        make: "Tesla",
        model: "Model 3",
        milesPerChange: 300,
    },
});

form.param("subscriptionId", ParameterType.SubscriptionId, {
    title: "Subscription",
    value: "/fake/sub2",
});

const carSection = form.section("carInfoSection", {
    title: "Car Info",
    description: "Information about the car's make, model, etc.",
});

carSection.param("make", ParameterType.String, {
    title: "Make",
    description: "The brand of the vehicle",
});

carSection.param("model", ParameterType.String, {
    title: "Model",
    value: "Model Y",
});

carSection.param("description", ParameterType.String, {
    title: "Description",
});

export const FormContainerDemo: React.FC = () => {
    const controllerRef = React.useRef<EditorController>();

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
        [editorError]
    );

    const editorChangeHandler = React.useCallback((textContent: string) => {
        try {
            if (JSON.stringify(form.values, undefined, 4) !== textContent) {
                form.values = JSON.parse(textContent);
            }
            setEditorError("");
        } catch (e) {
            setEditorError("Invalid JSON");
        }
    }, []);

    return (
        <DemoPane title="FormContainer">
            <DemoComponentContainer>
                <FormContainer form={form} onFormChange={formChangeHandler} />
            </DemoComponentContainer>

            <DemoControlContainer></DemoControlContainer>

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
