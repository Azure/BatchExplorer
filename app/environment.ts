import {
    ApplicationRef,
    enableProdMode,
} from "@angular/core";
import { enableDebugTools } from "@angular/platform-browser";

import { Environment } from "app/utils/constants";

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T { return value; };

if (ENV === Environment.prod) {
    enableProdMode();
} else {

    _decorateModuleRef = (modRef: any) => {
        const appRef = modRef.injector.get(ApplicationRef);
        const cmpRef = appRef.components[0];

        let _ng = (<any>window).ng;
        enableDebugTools(cmpRef);
        (<any>window).ng.probe = _ng.probe;
        (<any>window).ng.coreTokens = _ng.coreTokens;
        return modRef;
    };
}

export const decorateModuleRef = _decorateModuleRef;
