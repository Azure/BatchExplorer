
export interface ThemeDefinition {
    /**
     * Primary color
     */
    primary: string;

    /**
     * Danger and error color
     */
    danger: string;

    /**
     * Warning color
     */
    warn: string;

    /**
     * Success color
     */
    success: string;

    /**
     * Generic text color,
     */
    text: {
        primary: string;
        secondary: string;
    };
}
