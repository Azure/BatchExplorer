import * as React from "react";

/**
 * Renders a list of key/value pairs which generally correspond to a property
 * on a model
 */
export const PropertyList: React.FC = (props) => {
    return <div>{props.children}</div>;
};
