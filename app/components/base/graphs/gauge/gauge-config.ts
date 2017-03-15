
export interface GaugeLabel {
    value?: string;
    tooltip?: string;
}

export interface GaugeLabels {
    min?: GaugeLabel;
    max?: GaugeLabel;
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
