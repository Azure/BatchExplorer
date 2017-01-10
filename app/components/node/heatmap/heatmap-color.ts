import { ColorUtils } from "app/utils";
import { StateTree } from "./state-tree";


type ColorMap = { [key: string]: string };

/**
 * Utility which handle the color mapping for the heatmap.
 * This will handle lighten up all colors when highliting a state
 * as well as showing different colors for category and substate
 */
export class HeatmapColor {
    private _colors: ColorMap = {};

    constructor(private _stateTree: StateTree) {
        this.updateColors();
    }

    public get(key: string) {
        if (key in this._colors) {
            return this._colors[key];
        } else {
            console.error(`HeatmapColor: Cannot retrieve color, unknown key ${key}`);
        }
    }

    public updateColors(highlightedState?: string) {

        if (!highlightedState) {
            this._colors = this._initialColors();
        } else {
            this._colors = this._colorsForHighlight(highlightedState);
        }
    }

    /**
     * Compute the colors for the state when nothing is highlighted
     */
    private _initialColors(): ColorMap {
        const colors: ColorMap = {};
        for (let item of this._stateTree as any) {
            if (item.state) {
                colors[item.state] = item.color;
            } else {
                for (let subitem of item.states) {
                    colors[subitem.state] = item.color;
                }
            }
        }
        return colors;
    }

    /**
     * Compute the color when there is a state/category being highlighted
     */
    private _colorsForHighlight(highlightedState: string): ColorMap {
        const stateTree = this._stateTree;
        const colors: ColorMap = {};
        for (let item of stateTree as any) {
            if (item.state) {
                colors[item.state] = this._getHighlightColor(item.state, highlightedState, item.color);
            } else {
                if (item.category === highlightedState) {
                    for (let subitem of item.states) {
                        colors[subitem.state] = subitem.color;
                    }
                } else {
                    for (let subitem of item.states) {
                        colors[subitem.state] = this._getHighlightColor(subitem.state,
                            highlightedState,
                            subitem.color,
                            item.color);
                    }
                }
            }
        }
        return colors;
    }

    /**
     * Compute the color for the given key.
     * @param Key(state or category)
     * @param highlightedState(Currently highlighted state)
     * @param color Color of the item
     * @param categoryColor [Optional] If item is a subitem, color of the category
     */
    private _getHighlightColor(key, highlightedState, color, categoryColor = null) {
        if (key === highlightedState) {
            return color;
        } else {
            return ColorUtils.shadeColor(categoryColor || color, 0.8);
        }
    }
}
