
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
     * Overall background color
     */
    "main-background": string;

    /**
     * Background for any card on top the main background
     */
    "card-background": string;

    outline: string;

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

    /**
     * Breadcrumb color
     */
    breadcrumb: EntityColorDefinition;

    "file-explorer": {
        "folder-icon": string;
    };

    button: {
        "disabled-text": string;
        "disabled-bg": string;
    };
}
