import * as React from "react";
import { Stack } from "@fluentui/react/lib/Stack";
import { Label } from "@fluentui/react/lib/Label";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import type * as MonacoEditorImpl from "./MonacoEditorImpl";

/**
 * Import monaco dynamically.
 *
 * This avoids using import() to kludge around a problem with Typescript when it
 * is not using module = "esnext" (which prevents code splitting).
 *
 * See: https://github.com/webpack/webpack/issues/5703#issuecomment-357512412
 */
const MonacoEditorLazy = React.lazy(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = require as any;
    return new Promise<typeof MonacoEditorImpl>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return req.ensure([], (req: any) => resolve(req("./MonacoEditorImpl")));
    });
});

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
