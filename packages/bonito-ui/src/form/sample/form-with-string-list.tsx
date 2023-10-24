import * as React from "react";
import {
    StringListParameter,
    StringListVData,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { createReactForm } from "../react-form";
import { StringList } from "../../components/form/string-list";
import { LocationParameter } from "../location-parameter";

export type SampleFormValues = {
    listWithValidation?: string[];
    listWithoutValidation?: string[];
    justAString?: string;
    locationWithDeps?: string;
    locationWithoutDeps?: string;
};

const form = createReactForm<SampleFormValues>({
    values: {},
});

// Work as expected
form.param("listWithValidation", StringListParameter, {
    label: "List 1",
    onValidateSync: () => {
        const data: StringListVData = {
            1: "1",
            2: "2",
        };
        return new ValidationStatus("ok", "", data);
    },
    render(props) {
        return <StringList {...props} />;
    },
});

// Unexpected error if we don't provide a correct onValidateSync funciton
form.param("listWithoutValidation", StringListParameter, {
    label: "List 2",
    render(props) {
        return <StringList {...props} />;
    },
});

// Expected error if we use StringList control with a parameter that doesn't have a
// StringListVData type
form.param("justAString", StringParameter, {
    label: "Just a string",
    render(props) {
        return <StringList {...props} />;
    },
});

// Work as expected
form.param("locationWithDeps", LocationParameter, {
    label: "Storage account with deps",
    dependencies: {
        subscriptionId: "justAString",
    },
});

// Expected error if we don't provide dependencies
form.param("locationWithDeps", LocationParameter, {
    label: "Storage account with deps",
});
