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

import "font-awesome/css/font-awesome.min.css";
import "./environment";
import "./styles/main.scss";

// console.timeEnd("Load scripts");
// console.time("Bootstrap");

(remote.getCurrentWindow() as any).splashScreen.updateMessage("Initializing app");

platformBrowserDynamic().bootstrapModule(AppModule)
    .then(() => {
        // console.timeEnd("Bootstrap");
        // console.time("Render");
        // console.profile("Render profile");
    })
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
