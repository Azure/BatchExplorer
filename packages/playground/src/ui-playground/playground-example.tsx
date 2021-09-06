import * as React from "react";
import { HashRouter as Router } from "react-router-dom";
import { DemoNavMenu } from "./layout/demo-nav-menu";
import { DemoMainContent } from "./layout/demo-main-content";

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

            <Router>
                <div style={{ display: "flex" }}>
                    <div>
                        <DemoNavMenu />
                    </div>
                    <DemoMainContent />
                </div>
            </Router>
        </div>
    );
};
