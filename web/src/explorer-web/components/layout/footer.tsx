import * as React from "react";

export const Footer: React.FC = () => {
    return (
        <footer
            style={{
                padding: "16px",
                borderTop: "1px solid black",
                textAlign: "right",
            }}
        >
            &copy; 2021 Microsoft
        </footer>
    );
};
