import { CssColor, ThemeElement } from "app/services/themes/theme-core";
import * as tinycolor from "tinycolor2";
import { EntityColorDefinition, ThemeDefinition } from "./theme-definition.model";

export class ColorPalette extends ThemeElement {
    @CssColor("") public main: string;
    @CssColor() public light: string;
    @CssColor() public dark: string;

    @CssColor() public 50: string;
    @CssColor() public 100: string;
    @CssColor() public 200: string;
    @CssColor() public 300: string;
    @CssColor() public 400: string;
    @CssColor() public 500: string;
    @CssColor() public 600: string;
    @CssColor() public 700: string;
    @CssColor() public 800: string;
    @CssColor() public 900: string;
    @CssColor() public A100: string;
    @CssColor() public A200: string;
    @CssColor() public A400: string;
    @CssColor() public A700: string;

    constructor(color: string) {
        super();
        this._computeMaterialPalette(color);
    }

    private _computeMaterialPalette(base: string) {
        const baseLight = tinycolor("#ffffff");
        const baseDark = multiply(tinycolor(base).toRgb(), tinycolor(base).toRgb());
        const baseTriad = tinycolor(base).tetrad();
        Object.assign(this, {
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
        });
        this.main = this[500];
        this.light = this[300];
        this.dark = this[700];
    }
}

export class EntityColor extends ThemeElement {
    @CssColor() public text: string;
    @CssColor() public background: string;
    @CssColor("hover-text") public hoverText: string;
    @CssColor("hover-background") public hoverBackground: string;

    constructor(def: EntityColorDefinition) {
        super();
        this.text = def.text;
        this.background = def.background;
        this.hoverText = def["hover-text"] || def.text;
        this.hoverBackground = def["hover-background"] || def.background;
    }
}

export class FileExplorerColors extends ThemeElement {
    @CssColor("folder-icon") public folderIcon: string;

    constructor(def: ThemeDefinition["file-explorer"]) {
        super();
        this.folderIcon = def["folder-icon"];
    }
}

export class ButtonColors extends ThemeElement {
    @CssColor("disabled-text") public disabledText: string;
    @CssColor("disabled-bg") public disabledBg: string;

    constructor(def: ThemeDefinition["button"]) {
        super();
        this.disabledText = def["disabled-text"];
        this.disabledBg = def["disabled-bg"];
    }
}

export class TextColor extends ThemeElement {
    @CssColor() public primary: string;
    @CssColor() public secondary: string;

    constructor(def) {
        super();
        this.primary = def.primary;
        this.secondary = def.secondary;
    }
}

export class Theme extends ThemeElement {
    @CssColor() public primary: ColorPalette;
    @CssColor() public danger: ColorPalette;
    @CssColor() public warn: ColorPalette;
    @CssColor() public success: ColorPalette;
    @CssColor("main-background") public mainBackground: string;
    @CssColor("card-background") public cardBackground: string;
    @CssColor() public outline: string;
    @CssColor() public text: TextColor;
    @CssColor() public header: EntityColor;
    @CssColor() public navigation: EntityColor;
    @CssColor() public footer: EntityColor;
    @CssColor() public breadcrumb: EntityColor;
    @CssColor("file-explorer") public fileExplorer: FileExplorerColors;
    @CssColor() public button: ButtonColors;

    constructor(theme: ThemeDefinition) {
        super();
        this.primary = new ColorPalette(theme.primary);
        this.danger = new ColorPalette(theme.danger);
        this.warn = new ColorPalette(theme.warn);
        this.success = new ColorPalette(theme.success);
        this.outline = theme.outline;
        this.mainBackground = theme["main-background"];
        this.cardBackground = theme["card-background"];
        this.text = new TextColor(theme.text);
        this.header = new EntityColor(theme.header);
        this.navigation = new EntityColor(theme.navigation);
        this.footer = new EntityColor(theme.footer);
        this.breadcrumb = new EntityColor(theme.breadcrumb);
        this.fileExplorer = new FileExplorerColors(theme["file-explorer"]);
        this.button = new ButtonColors(theme.button);
    }

}

function multiply(rgb1, rgb2) {
    rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
    rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
    rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);
    return tinycolor("rgb " + rgb1.r + " " + rgb1.g + " " + rgb1.b);
}
