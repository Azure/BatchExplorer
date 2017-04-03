import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { remote } from "electron";

import { log } from "app/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "hammerjs";
import "./utils/extensions";

import "font-awesome/css/font-awesome.min.css";
import "font-mfizz/font/font-mfizz.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./assets/styles/main.scss";
import "./assets/vendor/font-linux/font-linux.css";
import "./environment";

(remote.getCurrentWindow() as any).splashScreen.updateMessage("Initializing app");
const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule).catch(error => {
    log.error("Bootstrapping failed :: ", error);
    handleCoreError(error);
});
