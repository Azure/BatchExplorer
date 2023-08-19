import * as React from "react";
import { DemoNavMenu } from "./layout/demo-nav-menu";
import { DemoMainContent } from "./layout/demo-main-content";
import { DemoName, getDemoFromUrl } from "./demo-routes";

export interface PlaygroundExampleProps {
    /**
     * Text to display
     */
    text?: string;
}

/**
 * Playground
 */
export const PlaygroundExample: React.FC<PlaygroundExampleProps> = () => {
    const [demoName, setDemoName] = React.useState<DemoName | undefined>(
        getDemoFromUrl()
    );

    // Listen to hash changes and update the currently selected demo
    React.useEffect(() => {
        const onHashChange = () => {
            const d = getDemoFromUrl();
            setDemoName(d);
        };

        addEventListener("hashchange", onHashChange);

        return () => {
            removeEventListener("hashchange", onHashChange);
        };
    }, []);

    return (
        <div>
            <h1
                style={{
                    fontSize: "1.5em",
                    margin: 0,
                    padding: "16px 16px 0",
                    fontWeight: 400,
                    userSelect: "none",
                }}
            >
                UI Component Playground
            </h1>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                }}
            ></div>

            <div style={{ display: "flex" }}>
                <div>
                    <DemoNavMenu />
                </div>
                <DemoMainContent demoName={demoName} />
            </div>
        </div>
    );
};
