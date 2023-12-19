import * as React from "react";
import { Stack } from "@fluentui/react/lib/Stack";
import { Label } from "@fluentui/react/lib/Label";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import type * as MonacoEditorImpl from "./MonacoEditorImpl";
// import MonacoEditorLazy from "./MonacoEditorImpl";

/**
 * Import monaco dynamically to allow for code splitting
 */
const MonacoEditorLazy = React.lazy(
    () =>
        import(/* webpackChunkName: "MonacoEditorImpl" */ "./MonacoEditorImpl")
);

const LoadingSpinner: React.FC = () => {
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Stack
                horizontal={true}
                verticalAlign={"center"}
                tokens={{ childrenGap: 10 }}
            >
                <Spinner size={SpinnerSize.large} />
                <Label>Loading...</Label>
            </Stack>
        </div>
    );
};

export const MonacoWrapper: React.FC<MonacoEditorImpl.MonacoEditorImplProps> = (
    props
) => {
    return (
        <>
            <React.Suspense
                fallback={
                    <div style={props.containerStyle}>
                        <LoadingSpinner />
                    </div>
                }
            >
                <MonacoEditorLazy {...props} />
            </React.Suspense>
        </>
    );
};
