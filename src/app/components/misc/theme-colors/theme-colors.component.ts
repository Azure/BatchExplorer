import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { ThemeService } from "app/services";
import { Subscription } from "rxjs";
import * as tinycolor from "tinycolor2";

import "./theme-colors.scss";

const varRegex = /var\((.*)\)/;
@Component({
    selector: "bl-theme-colors",
    templateUrl: "theme-colors.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeColorsComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Theme colors", icon: "fa-paint-brush" };
    }

    public colors: Array<{ key: string; value: string; }> = [];
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef, themeService: ThemeService) {
        this._sub = themeService.currentTheme.subscribe((theme) => {
            const color = theme.text.secondary;
            const contrast = theme.mainBackground;
            this.colors = theme.asCss().map(({ key, value }) => {
                let actualColor = value;
                const match = varRegex.exec(value);
                if (match) {
                    actualColor = getComputedStyle(document.documentElement).getPropertyValue(match[1]);
                }
                return {
                    key,
                    value: actualColor,
                    text: tinycolor.mostReadable(actualColor, [color, contrast]).toHexString(),
                };
            });
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackColor(index, color) {
        return color.key;
    }
}
