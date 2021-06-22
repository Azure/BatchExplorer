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
        <div className="hi">
            <h1
                style={{
                    fontSize: "2em",
                    margin: 0,
                    padding: 0,
                    fontWeight: 600,
                    lineHeight: 4,
                    userSelect: "none",
                    textAlign: "center",
                }}
            >
                Shared Component Library Playground
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
                    <div
                        style={{
                            padding: "2px",
                            width: "20%", //distance between "sidebar" and the actual elements being displayed
                        }}
                    >
                        <DemoNavMenu />
                    </div>

                    <DemoMainContent />
                </div>
            </Router>
        </div>
    );
};
