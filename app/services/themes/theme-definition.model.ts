
export interface EntityColorDefinition {
    text: string;
    background: string;
    "hover-text": string;
    "hover-background": string;
}

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

    /**
     * Header  color
     */
    header: EntityColorDefinition;

    /**
     * Left navigation color
     */
    navigation: EntityColorDefinition;

    /**
     * Footer color
     */
    footer: EntityColorDefinition;
}
