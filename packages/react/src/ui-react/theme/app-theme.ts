import { IPartialTheme, ISemanticColors, Theme } from "@fluentui/theme";

/**
 * Fully initialized app theme
 */
export interface AppTheme extends Theme {
    semanticColors: AppSemanticColors & ISemanticColors;
}

/**
 * Partial theme which still requires setting app-specific semantic colors
 */
export interface PartialAppTheme extends IPartialTheme {
    semanticColors: AppSemanticColors & Partial<ISemanticColors>;
}

/**
 * Additional semantic color slots used by apps (on top of the base FluentUI
 * semantic colors)
 */
export interface AppSemanticColors {
    appHeaderBackground: string;
    appHeaderText: string;
}
