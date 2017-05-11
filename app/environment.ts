import {
    enableProdMode,
} from "@angular/core";

import { Environment } from "app/utils/constants";

if (ENV === Environment.prod) {
    enableProdMode();
}
