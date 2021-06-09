import * as React from "react";

export interface PlaygroundExampleProps {
    /**
     * Text to display
     */
    text?: string;
}

/**
 * Example component
 */
export const PlaygroundExample: React.FC<PlaygroundExampleProps> = (props) => {
    return (
        <span className="be-example-simple">{props.text ?? "Hello from the playground package"}</span>
    );
};
