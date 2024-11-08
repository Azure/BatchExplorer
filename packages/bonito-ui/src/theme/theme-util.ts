import {
    AzureThemeLight,
    AzureThemeDark,
    AzureThemeHighContrastLight,
    AzureThemeHighContrastDark,
} from "@fluentui/azure-themes";
import { Theme, mergeThemes } from "@fluentui/theme";
import {
    ExplorerThemeDark,
    ExplorerThemeHighContrastDark,
    ExplorerThemeHighContrastLight,
    ExplorerThemeLight,
} from "./explorer-theme";
import { AppTheme } from "./app-theme";
import { useTheme } from "@fluentui/react/lib/Theme";
import { getLogger } from "@azure/bonito-core";
import {
    CycleThemeDark,
    CycleThemeHighContrastDark,
    CycleThemeHighContrastLight,
    CycleThemeLight,
} from "./azure-theme";

export const BaseThemeLight = AzureThemeLight;
export const BaseThemeDark = AzureThemeDark;
export const BaseThemeHighContrastLight = AzureThemeHighContrastLight;
export const BaseThemeHighContrastDark = AzureThemeHighContrastDark;

/**
 * The name of the default theme
 */
export const defaultTheme = "explorerDark";

/**
 * React component hook that returns a theme as an AppTheme rather than a
 * base FluentUI theme.
 *
 * @returns The theme in effect for the current component
 */
export function useAppTheme(): AppTheme {
    return useTheme() as AppTheme;
}

/**
 * An object containing a friendly theme label and a function for
 * getting a theme
 */
export interface ThemeInfo extends ThemeMapEntry {
    name: string;
}

/**
 * Gets all supported themes
 *
 * @returns A list of objects which contain metadata on each theme
 */
export function listThemes(): ThemeInfo[] {
    const sortedNames = Object.keys(_themeMap).sort() as ThemeName[];
    const themes: ThemeInfo[] = [];
    for (const n of sortedNames) {
        const entry = _themeMap[n];
        themes.push({
            name: n,
            label: entry.label,
            get: entry.get,
        });
    }
    return themes;
}

export type ThemeName = keyof typeof _themeMap;

/**
 * Gets a theme by name
 *
 * @returns A FluentUI theme
 */
export function getTheme(themeName: ThemeName | "default"): ThemeInfo {
    let mapInfo;
    if (themeName === "default") {
        mapInfo = _themeMap[defaultTheme];
    } else {
        mapInfo = _themeMap[themeName];
        if (!mapInfo) {
            getLogger("getTheme").error(
                `Unable to load theme ${themeName}: Falling back to default`
            );
            mapInfo = _themeMap[defaultTheme];
        }
    }
    return {
        name: themeName,
        label: mapInfo.label,
        get: mapInfo.get,
    };
}

interface ThemeMapEntry {
    label: string;
    get: () => AppTheme;
}

const _themeMap = {
    cycleLight: {
        label: "Cycle Light",
        get: () => {
            return _getThemeLazy("cycleLight", BaseThemeLight, (baseTheme) => {
                return mergeThemes(baseTheme, CycleThemeLight) as AppTheme;
            });
        },
    },
    cycleDark: {
        label: "Cycle Dark",
        get: () => {
            return _getThemeLazy("cycleDark", BaseThemeDark, (baseTheme) => {
                return mergeThemes(baseTheme, CycleThemeDark) as AppTheme;
            });
        },
    },
    cycleHighContrastLight: {
        label: "Cycle High Contrast (Light)",
        get: () => {
            return _getThemeLazy(
                "cycleHighContrastLight",
                BaseThemeHighContrastLight,
                (baseTheme) => {
                    return mergeThemes(
                        baseTheme,
                        CycleThemeHighContrastLight
                    ) as AppTheme;
                }
            );
        },
    },
    cycleHighContrastDark: {
        label: "Cycle High Contrast (Dark)",
        get: () => {
            return _getThemeLazy(
                "cycleHighContrastDark",
                BaseThemeHighContrastDark,
                (baseTheme) => {
                    return mergeThemes(
                        baseTheme,
                        CycleThemeHighContrastDark
                    ) as AppTheme;
                }
            );
        },
    },
    explorerLight: {
        label: "Explorer Light",
        get: () => {
            return _getThemeLazy(
                "explorerLight",
                BaseThemeLight,
                (baseTheme) => {
                    return mergeThemes(
                        baseTheme,
                        ExplorerThemeLight
                    ) as AppTheme;
                }
            );
        },
    },
    explorerDark: {
        label: "Explorer Dark",
        get: () => {
            return _getThemeLazy("explorerDark", BaseThemeDark, (baseTheme) => {
                return mergeThemes(baseTheme, ExplorerThemeDark) as AppTheme;
            });
        },
    },
    explorerHighContrastLight: {
        label: "Explorer High Contrast (Light)",
        get: () => {
            return _getThemeLazy(
                "explorerHighContrastLight",
                BaseThemeHighContrastLight,
                (baseTheme) => {
                    return mergeThemes(
                        baseTheme,
                        ExplorerThemeHighContrastLight
                    ) as AppTheme;
                }
            );
        },
    },
    explorerHighContrastDark: {
        label: "Explorer High Contrast (Dark)",
        get: () => {
            return _getThemeLazy(
                "explorerHighContrastDark",
                BaseThemeHighContrastDark,
                (baseTheme) => {
                    return mergeThemes(
                        baseTheme,
                        ExplorerThemeHighContrastDark
                    ) as AppTheme;
                }
            );
        },
    },
};

const _themeCache: Record<string, AppTheme> = {};

/**
 * Helper function to create a theme or get one from the cache
 */
function _getThemeLazy(
    themeName: string,
    baseTheme: Theme,
    createTheme: (baseTheme: Theme) => AppTheme
) {
    if (!_themeCache[themeName]) {
        _themeCache[themeName] = createTheme(baseTheme);
    }
    return _themeCache[themeName];
}
