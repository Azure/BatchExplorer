
export interface EntityColorDefinition {
    text: string;
    background: string;
    "hover-text": string;
    "hover-background": string;
}

export interface ThemeDefinition {
    type: "high-contrast" | "standard";

    /**
     * Primary color
     */
    primary: string;

    /**
     * Primary color contrast
     */
    "primary-contrast": string;

    /**
     * Danger and error color
     */
    danger: string;

    /**
     * Danger color contrast
     */
    "danger-contrast": string;

    /**
     * Warning color
     */
    warn: string;

    /**
     * Warning color contrast
     */
    "warn-contrast": string;

    /**
     * Success color
     */
    success: string;

    /**
     * Primary color contrast
     */
    "success-contrast": string;

    /**
     * Overall background color
     */
    "main-background": string;

    /**
     * Secondary Background
     */
    "secondary-background": string;

    /**
     * Background for any card on top the main background
     */
    "card-background": string;

    /**
     * Background color for items overed by the mouse
     */
    "hover-bg": string;

    /**
     * Background color for selected items
     */
    "selection": string;

    /**
     * Color for borders
     */
    "border": string;

    outline: string;

    editor: string;

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
        "basic-text": string;
        "basic-bg": string;
        "basic-hover-bg": string;
        "disabled-text": string;
        "disabled-bg": string;
    };

    monitorChart: {
        "core-count": string;
        "low-priority-core-count": string;
        "task-start-event": string;
        "task-complete-event": string;
        "task-fail-event": string;
        "starting-node-count": string;
        "idle-node-count": string;
        "running-node-count": string;
        "start-task-failed-node-count": string;
        "rebooting-node-count": string;
    };

    input: {
        text: string;
        background: string;
        placehold: string;
        border: string;
        focusBorder: string;
        "disabled-border": string;
        "disabled-text": string;
        "disabled-background": string;
    };
    "chart-colors": string[];
}
