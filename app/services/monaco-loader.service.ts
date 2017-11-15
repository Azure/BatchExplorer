import { Injectable } from "@angular/core";
import { AutoscaleLanguage } from "app/utils/autoscale";

const anyWindow: any = window;

@Injectable()
export class MonacoLoader {
    private _promise: Promise<any>;
    constructor() {
        this._promise = this.load().then(() => {
            AutoscaleLanguage.define();
        });
    }

    public get(): Promise<any> {
        return this._promise;
    }

    public load(): Promise<any> {
        return new Promise((resolve) => {

            const onGotAmdLoader = () => {
                // anyWindow.amdRequire.config({ paths: { vs: "build/vendor/vs" } });
                anyWindow.amdRequire.config({ baseUrl: "D:/dev/js/BatchLabs/build/vendor/" });
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
                let loaderScript = document.createElement("script");
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
