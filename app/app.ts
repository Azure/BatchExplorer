import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { log } from "app/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "hammerjs";
import "./utils/extensions";

import "font-awesome/css/font-awesome.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./assets/styles/main.scss";
import "./environment";

const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule).catch(error => {
    log.error("Bootstrapping failed :: ", error);
    handleCoreError(error);
});

log.error("Banana are bood", { wut: "is this" });
