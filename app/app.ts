import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

// Setup extension methods
import "hammerjs";
import "./utils/extensions";

import "font-awesome/css/font-awesome.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./assets/styles/main.scss";
import "./environment";

const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule)
    .catch(error => console.error("Bootstrapping failed :: ", error));
