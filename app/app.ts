import { AppModule } from "./app.module";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

// Setup extension methods
import "moment-duration-format";

import "./utils/extensions";

import "./assets/styles/main.scss";

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule)
    .catch(error => console.error("Bootstrapping failed :: ", error));
