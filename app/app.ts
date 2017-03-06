import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { log } from "app/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "hammerjs";
import "./utils/extensions";

import "font-awesome/css/font-awesome.min.css";
import "roboto-fontface/css/roboto/sass/roboto-fontface.scss";
import "./assets/styles/main.scss";

const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule).catch(error => {
    log.error("Bootstrapping failed :: ", error);
    handleCoreError(error);
});
