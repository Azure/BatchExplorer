import { FormParameterType } from "@batch/ui-common/lib/form";
import * as React from "react";
import { FormContainer } from "../form-container";
import { FormControl } from "../form-control";
import { SectionContainer } from "../section-container";

test("Can render a simple form", () => {
    const container = (
        <FormContainer form={{ id: "createCar" }}>
            <SectionContainer
                section={{
                    id: "required",
                    label: "Required fields",
                }}
            >
                <FormControl
                    parameter={{
                        id: "make",
                        label: "Car make",
                        type: FormParameterType.String,
                    }}
                />
                <FormControl parameter={{ id: "model" }} />
            </SectionContainer>
            <SectionContainer section={{ id: "optional" }}>
                <FormControl parameter={{ id: "description" }} />
            </SectionContainer>
        </FormContainer>
    );
    expect(container).toBeDefined();
});
