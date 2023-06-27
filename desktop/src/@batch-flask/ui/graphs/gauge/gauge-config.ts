
export interface GaugeLabel {
    /**
     * Specify this to override the default displayed value of the label.
     */
    value?: string;

    /**
     * Specify this to add a tooltip when hovering the value.
     */
    tooltip?: string;
}

export interface GaugeLabels {
    /**
     * Specify to add a tooltip or change the default value for the min label
     * @default value: options.min
     */
    min?: GaugeLabel;

    /**
     * Specify to add a tooltip or change the default value for the max label
     * @default value: options.max
     */
    max?: GaugeLabel;

    /**
     * Specify to add a tooltip or change the default value for the value label
     * @default value: value given to the component
     */
    value?: GaugeLabel;
}

export interface GaugeConfig {
    min?: number;
    max?: number;
    showLabels?: boolean;
    title?: string;
    labels?: GaugeLabels;
}

export const defaultOptions: GaugeConfig = {
    min: 0,
    max: 1,
    showLabels: true,
};
