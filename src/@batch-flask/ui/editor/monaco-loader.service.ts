import { Injectable, OnDestroy } from "@angular/core";
import { OS } from "@batch-flask/utils";
import * as path from "path";
import { Subscription } from "rxjs";
import { AutoscaleLanguage } from "./monaco-languages/autoscale.language";
import { JsonLanguage } from "./monaco-languages/json/json.language";

const anyWindow: any = window;

@Injectable()
export class MonacoLoader implements OnDestroy {
    private _sub: Subscription;
    private _promise: Promise<any>;
    private _theme: string;

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
    public init(root: string) {
        this._promise = this.load(root).then(() => {
            AutoscaleLanguage.define();
            JsonLanguage.define();
            this._updateTheme();
        });
    }

    public setTheme(theme: string) {
        this._theme = theme;
        this._updateTheme();
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

    private _updateTheme() {
        if (this._theme && (window as any).monaco) {
            monaco.editor.setTheme(this._theme);
        }
    }
}
