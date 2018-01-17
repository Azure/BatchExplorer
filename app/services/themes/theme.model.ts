import * as tinycolor from "tinycolor2";
import { EntityColorDefinition, ThemeDefinition } from "./theme-definition.model";

export interface ColorPalette {
    main: string;
    light: string;
    dark: string;

    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    A100: string;
    A200: string;
    A400: string;
    A700: string;
}

export class EntityColor {
    public text: string;
    public background: string;
    public hoverText: string;
    public hoverBackground: string;

    constructor(def: EntityColorDefinition) {
        this.text = def.text;
        this.background = def.background;
        this.hoverText = def["hover-text"];
        this.hoverBackground = def["hover-background"];
    }
}

export class Theme {
    public primary: ColorPalette;
    public danger: ColorPalette;
    public warn: ColorPalette;
    public success: ColorPalette;
    public text: {
        primary: string;
        secondary: string;
    };
    public header: EntityColor;
    public navigation: EntityColor;
    public footer: EntityColor;

    constructor(theme: ThemeDefinition) {
        this.primary = this._computeMaterialPalette(theme.primary);
        this.danger = this._computeMaterialPalette(theme.danger);
        this.warn = this._computeMaterialPalette(theme.warn);
        this.success = this._computeMaterialPalette(theme.success);
        this.text = theme.text;
        this.header = new EntityColor(theme.header);
        this.navigation = new EntityColor(theme.navigation);
        this.footer = new EntityColor(theme.footer);
    }

    private _computeMaterialPalette(base: string): ColorPalette {
        const baseLight = tinycolor("#ffffff");
        const baseDark = multiply(tinycolor(base).toRgb(), tinycolor(base).toRgb());
        const baseTriad = tinycolor(base).tetrad();
        const a: any = {
            50: tinycolor.mix(baseLight, base, 12).toHexString(),
            100: tinycolor.mix(baseLight, base, 30).toHexString(),
            200: tinycolor.mix(baseLight, base, 50).toHexString(),
            300: tinycolor.mix(baseLight, base, 70).toHexString(),
            400: tinycolor.mix(baseLight, base, 85).toHexString(),
            500: tinycolor.mix(baseLight, base, 100).toHexString(),
            600: tinycolor.mix(baseDark, base, 87).toHexString(),
            700: tinycolor.mix(baseDark, base, 70).toHexString(),
            800: tinycolor.mix(baseDark, base, 54).toHexString(),
            900: tinycolor.mix(baseDark, base, 25).toHexString(),
            A100: tinycolor.mix(baseDark, baseTriad[4], 15).saturate(80).lighten(65).toHexString(),
            A200: tinycolor.mix(baseDark, baseTriad[4], 15).saturate(80).lighten(55).toHexString(),
            A400: tinycolor.mix(baseDark, baseTriad[4], 15).saturate(100).lighten(45).toHexString(),
            A700: tinycolor.mix(baseDark, baseTriad[4], 15).saturate(100).lighten(40).toHexString(),
        };
        a.main = a[500];
        a.light = a[300];
        a.dark = a[700];
        return a;
    }
}

function multiply(rgb1, rgb2) {
    rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
    rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
    rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);
    return tinycolor("rgb " + rgb1.r + " " + rgb1.g + " " + rgb1.b);
}
