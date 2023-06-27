import * as React from "react";

export interface DemoComponentContainerProps {
    centered?: boolean;
    minWidth?: string;
    maxWidth?: string;
}

/**
 * Container component for individual components being demoed
 */
export const DemoComponentContainer: React.FC<DemoComponentContainerProps> = (
    props
) => {
    const { centered, children, minWidth, maxWidth } = props;
    return (
        <div
            style={{
                display: "flex",
                justifyContent: centered ? "center" : undefined,
                padding: "32px",
            }}
        >
            <div
                style={{
                    minWidth: minWidth,
                    maxWidth: maxWidth,
                }}
            >
                {children}
            </div>
        </div>
    );
};
DemoComponentContainer.defaultProps = {
    centered: true,
    minWidth: "100%",
    maxWidth: "100%",
};
