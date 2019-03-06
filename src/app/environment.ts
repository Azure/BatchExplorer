import {
    enableProdMode,
} from "@angular/core";
import { Environment } from "common/constants";

if (ENV === Environment.prod) {
    enableProdMode();
}
