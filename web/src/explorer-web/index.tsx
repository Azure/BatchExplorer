import { EnvironmentMode, initEnvironment } from "@batch/ui-common";
import { DependencyName } from "@batch/ui-common/lib/environment";
import { ConsoleLogger } from "@batch/ui-common/lib/logging";
import { MockHttpClient } from "@batch/ui-common/lib/http";
import { BrowserEnvironment } from "@batch/ui-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./components";

// Defined by webpack
declare const ENV: {
    MODE: EnvironmentMode;
};

export function init(rootEl: HTMLElement): void {
    initEnvironment(
        new BrowserEnvironment(
            {
                mode: ENV.MODE ?? EnvironmentMode.Development,
            },
            {
                [DependencyName.Logger]: () => new ConsoleLogger(),
                [DependencyName.HttpClient]: () => new MockHttpClient(),
            }
        )
    );
    ReactDOM.render(<Application />, rootEl);
}
