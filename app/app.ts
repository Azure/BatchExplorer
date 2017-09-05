import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { remote } from "electron";
import * as MouseTrap from "mousetrap";

import "./utils/extensions";

import { log } from "app/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "hammerjs";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/lib/codemirror.css";
import "font-awesome/css/font-awesome.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./environment";
import "./styles/main.scss";

(remote.getCurrentWindow() as any).splashScreen.updateMessage("Initializing app");
const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule)
    .catch(error => {
        log.error("Bootstrapping failed :: ", error);
        handleCoreError(error);
    });

MouseTrap.bind("ctrl+shift+i", () => {
    if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
        remote.getCurrentWindow().webContents.closeDevTools();
    } else {
        remote.getCurrentWindow().webContents.openDevTools();
    }
});

MouseTrap.bind("ctrl+r", () => {
    location.reload();
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
