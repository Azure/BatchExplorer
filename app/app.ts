import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

// Setup extension methods
import "hammerjs";
import "moment-duration-format";

import "./utils/extensions";

import "./assets/styles/main.scss";

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule)
    .catch(error => console.error("Bootstrapping failed :: ", error));
