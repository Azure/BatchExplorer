import { CssColor, ThemeElement } from "app/services/themes/theme-core";
import * as tinycolor from "tinycolor2";
import { ChartColors } from "./chart-colors";
import { EntityColorDefinition, ThemeDefinition } from "./theme-definition.model";

export class ColorPalette extends ThemeElement<string> {
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
        super(color);
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
            A100: tinycolor.mix(baseDark, baseTriad[3], 15).saturate(80).lighten(65).toHexString(),
            A200: tinycolor.mix(baseDark, baseTriad[3], 15).saturate(80).lighten(55).toHexString(),
            A400: tinycolor.mix(baseDark, baseTriad[3], 15).saturate(100).lighten(45).toHexString(),
            A700: tinycolor.mix(baseDark, baseTriad[3], 15).saturate(100).lighten(40).toHexString(),
        });
        this.main = this[500];
        this.light = this[300];
        this.dark = this[700];
    }
}

export class EntityColor extends ThemeElement<EntityColorDefinition> {
    @CssColor() public text: string;
    @CssColor() public background: string;
    @CssColor("hover-text") public hoverText: string;
    @CssColor("hover-background") public hoverBackground: string;

    constructor(def: EntityColorDefinition) {
        super(def);
        this.hoverText = this.hoverText || def.text;
        this.hoverBackground = this.hoverBackground || def.background;
    }
}

export class InputColor extends ThemeElement<EntityColorDefinition> {
    @CssColor() public text: string;
    @CssColor() public background: string;
    @CssColor() public placeholder: string;
    @CssColor() public border: string;
    @CssColor("focus-border") public focusBorder: string;
    @CssColor("disabled-text") public disabledText: string;
    @CssColor("disabled-border") public disabledBorder: string;
    @CssColor("disabled-background") public disabledBackground: string;

    constructor(def) {
        super(def);
        this.focusBorder = this.focusBorder || this.border;
        this.disabledBorder = this.disabledBorder || this.disabledBorder;
        this.disabledText = this.disabledText || this.text;
        this.disabledBackground = this.disabledBackground || this.background;
    }
}

export class FileExplorerColors extends ThemeElement<ThemeDefinition["file-explorer"]> {
    @CssColor("folder-icon") public folderIcon: string;
}

export class ButtonColors extends ThemeElement<ThemeDefinition["button"]> {
    @CssColor("basic-text") public basicText: string;
    @CssColor("basic-bg") public basicBg: string;
    @CssColor("basic-hover-bg") public basicHoverBg: string;
    @CssColor("disabled-text") public disabledText: string;
    @CssColor("focus-text") public focusText: string;
    @CssColor("disabled-bg") public disabledBg: string;
}

export class TextColor extends ThemeElement<ThemeDefinition["text"]> {
    @CssColor() public primary: string;
    @CssColor() public secondary: string;
}

export class MonitorChartColor extends ThemeElement<ThemeDefinition["monitorChart"]> {
    @CssColor("core-count") public coreCount: string;
    @CssColor("low-priority-core-count") public lowPriorityCoreCount: string;
    @CssColor("task-start-event") public taskStartEvent: string;
    @CssColor("task-complete-event") public taskCompleteEvent: string;
    @CssColor("task-fail-event") public taskFailEvent: string;
    @CssColor("starting-node-count") public startingNodeCount: string;
    @CssColor("idle-node-count") public idleNodeCount: string;
    @CssColor("running-node-count") public runningNodeCount: string;
    @CssColor("start-task-failed-node-count") public startTaskFailedNodeCount: string;
    @CssColor("rebooting-node-count") public rebootingNodeCount: string;
}

export class Theme extends ThemeElement<ThemeDefinition> {
    @CssColor() public primary: ColorPalette;
    @CssColor("primary-contrast") public primaryContrast: ColorPalette;
    @CssColor() public danger: ColorPalette;
    @CssColor("danger-contrast") public dangerContrast: ColorPalette;
    @CssColor() public warn: ColorPalette;
    @CssColor("warn-contrast") public warnContrast: ColorPalette;
    @CssColor() public success: ColorPalette;
    @CssColor("success-contrast") public successContrast: ColorPalette;
    @CssColor("main-background") public mainBackground: string;
    @CssColor("secondary-background") public secondaryBackground: string;
    @CssColor("card-background") public cardBackground: string;
    @CssColor("hover-bg") public hoverBackground: string;
    @CssColor() public selection: string;
    @CssColor() public border: string;
    @CssColor() public outline: string;
    @CssColor() public text: TextColor;
    @CssColor() public header: EntityColor;
    @CssColor() public navigation: EntityColor;
    @CssColor() public footer: EntityColor;
    @CssColor() public breadcrumb: EntityColor;
    @CssColor("file-explorer") public fileExplorer: FileExplorerColors;
    @CssColor() public button: ButtonColors;
    @CssColor() public monitorChart: MonitorChartColor;
    @CssColor() public input: InputColor;
    @CssColor() public editor: string;
    @CssColor("chart-colors") public chartColors: ChartColors;

    public isHighContrast: boolean;
    public name: string;

    constructor(name: string, data: ThemeDefinition) {
        super(data);
        this.isHighContrast = data.type === "high-contrast";
        this.name = name;
    }
}

function multiply(rgb1, rgb2) {
    rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
    rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
    rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);
    return tinycolor("rgb " + rgb1.r + " " + rgb1.g + " " + rgb1.b);
}
