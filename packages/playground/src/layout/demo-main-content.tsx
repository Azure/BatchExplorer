import * as React from "react";
import { DemoName, DEMO_MAP } from "../demo-routes";

export interface DemoMainContentProps {
    demoName?: DemoName;
}

export const DemoMainContent: React.FC<DemoMainContentProps> = (props) => {
    const demoName = props.demoName ?? "default";
    return DEMO_MAP[demoName]();
};
