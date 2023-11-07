import { StringListParameter } from "@azure/bonito-core/lib/form";
import { createParam } from "@azure/bonito-ui";
import { StringList } from "@azure/bonito-ui/lib/components/form";
import React from "react";
import { DemoComponentContainer } from "../../../layout/demo-component-container";
import { DemoPane } from "../../../layout/demo-pane";

export const StringListDemo: React.FC = () => {
    return (
        <DemoPane title="StringList">
            <DemoComponentContainer>
                <StringList
                    param={createParam(StringListParameter, {
                        label: "String List",
                        value: [],
                    })}
                    onChange={(_, value) => {
                        // eslint-disable-next-line no-console
                        console.log("String List change:", value);
                    }}
                />
            </DemoComponentContainer>
        </DemoPane>
    );
};
