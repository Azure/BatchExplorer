import * as React from "react";
import { RootPane } from "@azure/bonito-ui/lib/components";
import { ThemeName } from "@azure/bonito-ui/lib/theme";

export interface RootProps extends React.PropsWithChildren {
    theme?: ThemeName;
}

export const AppRoot: React.FC<RootProps> = (props) => {
    return <RootPane theme={props.theme}>{props.children}</RootPane>;
};
