import * as React from "react";
import { RootPane } from "@batch/ui-react/lib/components/layout";
export interface RootProps {
    theme?: string;
}

export const AppRoot: React.FC<RootProps> = (props) => {
    return <RootPane theme={props.theme}>{props.children}</RootPane>;
};
