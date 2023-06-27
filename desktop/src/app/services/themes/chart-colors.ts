import tinycolor from "tinycolor2";
import { ThemeElement } from "./theme-core";
import { ThemeDefinition } from "./theme-definition.model";

export class ChartColors extends ThemeElement<ThemeDefinition["chart-colors"]> {
    constructor(private colors: string[]) {
        super(colors);
    }

    /**
     * Get the nth color in the palette
     * @param i {Number}
     */
    public get(i: number) {
        const len = this.colors.length;
        if (i < len) {
            return this.colors[i];
        }
        const mod = i % len;
        const depth = Math.floor(i / len) - 1;
        const startColor = this.colors[mod];
        const endColor = this.colors[(mod + 1) % len];
        return this._findColor(startColor, endColor, depth);
    }

    private _findColor(startColor: string, endColor: string, index: number) {
        return tinycolor.mix(startColor, endColor, this._getMixRation(index).val).toHexString();
    }

    /**
     * Get the amount to mix the 2 color depending on the index.
     * @returns the value at the given index in the serie 50 25 75 12.5, 37.5, 62.5, ...
     * @param index Index
     */
    private _getMixRation(index: number) {
        if (index === 0) {
            return { val: 50, depth: 1 };
        } else {
            const parentIndex = Math.floor((index - 1) / 2);
            const left = parentIndex === (index - 1) / 2;
            const { depth, val } = this._getMixRation(parentIndex);
            const step = 100 / Math.pow(2, depth + 1);
            if (left) {
                return { val: val - step, depth: depth + 1 };
            } else {
                return { val: val + step, depth: depth + 1 };
            }
        }
    }
}
