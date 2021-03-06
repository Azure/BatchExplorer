import * as React from "react";

export interface SimpleExampleProps {
    /**
     * Text to display
     */
    text?: string;
}

/**
 * Example component used for testing as well as a reference for new components
 */
export const SimpleExample: React.FC<SimpleExampleProps> = (props) => {
    return (
        <span className="be-example-simple">{props.text ?? "Hello world"}</span>
    );
};
