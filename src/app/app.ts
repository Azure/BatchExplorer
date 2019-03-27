// tslint:disable: ordered-imports
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { ipcRenderer, remote } from "electron";

import "@batch-flask/extensions";

import { log } from "@batch-flask/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "focus-visible/dist/focus-visible.min.js";
import "hammerjs";

import "font-awesome/css/font-awesome.min.css";
import "./environment";
import "./styles/main.scss";

import "app/commands";

interface LoadingTimeResults {
    startup: number;
    loadTranslations: number;
    bootstrap: number;
}

const starts = {
    startup: (window as any).STARTUP_TIME,
};

const durations: LoadingTimeResults = {} as any;

function time(key: keyof (LoadingTimeResults)) {
    starts[key] = new Date().getTime();
}

function timeEnd(key: keyof (LoadingTimeResults)) {
    if (key in starts) {
        const start = starts[key];
        const end = new Date().getTime();
        durations[key] = end - start;
    }
}

timeEnd("startup");
ipcRenderer.send("initializing");

Promise.resolve().then(() => {
    if (process.env.NODE_ENV !== "production") {
        time("loadTranslations");
        return (remote.getCurrentWindow() as any).translationsLoader.load();
    }
}).then(() => {
    timeEnd("loadTranslations");
    time("bootstrap");
    return platformBrowserDynamic().bootstrapModule(AppModule);
}).then(() => {
    timeEnd("bootstrap");
    // tslint:disable-next-line:no-console
    console.log("Loading times", durations);
}).catch(error => {
    log.error("Bootstrapping failed :: ", error);
    handleCoreError(error);
});

document.addEventListener("dragover", (event) => {
    event.dataTransfer.dropEffect = "none";
    event.preventDefault();
    return false;
}, false);

document.addEventListener("drop", (event) => {
    event.preventDefault();
    return false;
}, false);
