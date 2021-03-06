import {
    AzureThemeLight,
    AzureThemeDark,
    AzureThemeHighContrastLight,
    AzureThemeHighContrastDark,
} from "@uifabric/azure-themes";
import { Theme, mergeThemes } from "@fluentui/theme";
import {
    ExplorerThemeDark,
    ExplorerThemeHighContrastDark,
    ExplorerThemeHighContrastLight,
    ExplorerThemeLight,
} from "./explorer-theme";
import { AppTheme } from "./app-theme";
import { useTheme } from "@fluentui/react-theme-provider";

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
    const sortedNames = Object.keys(_themeMap).sort();
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

/**
 * Gets a theme by name
 *
 * @returns A FluentUI theme
 */
export function getTheme(themeName: string): ThemeInfo {
    let mapInfo = _themeMap[themeName];
    if (!mapInfo) {
        console.error(
            `Unable to load theme ${themeName}: Falling back to default`
        );
        mapInfo = _themeMap[defaultTheme];
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

const _themeMap: Record<string, ThemeMapEntry> = {
    explorerLight: {
        label: "Light",
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
        label: "Dark",
        get: () => {
            return _getThemeLazy("explorerDark", BaseThemeDark, (baseTheme) => {
                return mergeThemes(baseTheme, ExplorerThemeDark) as AppTheme;
            });
        },
    },
    explorerHighContrastLight: {
        label: "High Contrast (Light)",
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
        label: "High Contrast (Dark)",
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
