import * as React from "react";

export interface DemoControlContainerProps {
    hideDefaultControls?: boolean;
}

/**
 * Container component for individual components being demoed
 */
export const DemoControlContainer: React.FC<DemoControlContainerProps> = (
    props
) => {
    const { children } = props;
    return (
        <div
            style={{
                marginTop: "32px",
                display: "grid",
                gridTemplateColumns:
                    // Don't span more than 3 columns
                    "repeat(auto-fill, minmax(max(250px, 100% / 4), 1fr))",
                justifyItems: "center",
                gap: "20px",
                rowGap: "32px",
                columnGap: "16px",
            }}
        >
            {children}
        </div>
    );
};
