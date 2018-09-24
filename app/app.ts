import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { ipcRenderer, remote } from "electron";

import "@batch-flask/extensions";

import { log } from "@batch-flask/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "hammerjs";

import "flag-icon-css/css/flag-icon.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./environment";
import "./styles/main.scss";

// console.timeEnd("Load scripts");
// console.time("Bootstrap");

ipcRenderer.send("initializing");

Promise.resolve().then(() => {
    if (process.env.NODE_ENV !== "production") {
        return (remote.getCurrentWindow() as any).translationsLoader.load();
    }
}).then(() => {
    return platformBrowserDynamic().bootstrapModule(AppModule);
}).then(() => {
    // console.timeEnd("Bootstrap");
    // console.time("Render");
    // console.profile("Render profile");
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
