import { Injectable } from "@angular/core";
import { OS } from "@batch-flask/utils";

import { AutoscaleLanguage } from "./monaco-languages/autoscale.language";
import { JsonLanguage } from "./monaco-languages/json/json.language";

import * as path from "path";

const anyWindow: any = window;

@Injectable()
export class MonacoLoader {
    private _promise: Promise<any>;

    public init(root: string) {
        this._promise = this.load(root).then(() => {
            AutoscaleLanguage.define();
            JsonLanguage.define();
        });
    }

    public get(): Promise<any> {
        return this._promise;
    }

    public load(root: string): Promise<any> {
        return new Promise((resolve) => {
            let baseUrl = path.join(root, "build/vendor/");
            if (!OS.isWindows()) {
                baseUrl = `file://${baseUrl}`;
            }
            const onGotAmdLoader = () => {
                anyWindow.amdRequire.config({ baseUrl });
                // workaround monaco-css not understanding the environment
                (self as any).module = undefined;
                // workaround monaco-typescript not understanding the environment
                (self as any).process.browser = true;
                anyWindow.amdRequire(["vs/editor/editor.main"], () => {
                    resolve(anyWindow.monaco);
                });
            };

            // Load AMD loader if necessary
            if (!anyWindow.amdRequire) {
                const nodeRequire = anyWindow.require;
                const loaderScript = document.createElement("script");
                loaderScript.type = "text/javascript";
                loaderScript.src = "vendor/vs/loader.js";
                loaderScript.addEventListener("load", () => {
                    anyWindow.amdRequire = anyWindow.require;
                    anyWindow.require = nodeRequire;
                    onGotAmdLoader();
                });
                document.body.appendChild(loaderScript);
            } else {
                onGotAmdLoader();
            }
        });
    }
}
