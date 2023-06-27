import * as React from "react";

const contentPaneStyles: React.CSSProperties = {
    padding: "16px",
};

/**
 * A block element container which contains padded content
 */
export const ContentPane: React.FC = (props) => {
    return (
        <div className="be-content-pane" style={contentPaneStyles}>
            {props.children}
        </div>
    );
};
