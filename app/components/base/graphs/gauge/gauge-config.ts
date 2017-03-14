
export interface GaugeConfig {
    min?: number;
    max?: number;
    showLabels?: boolean;
    title?: string;
}

export const defaultOptions: GaugeConfig = {
    min: 0,
    max: 1,
    showLabels: true,
};
