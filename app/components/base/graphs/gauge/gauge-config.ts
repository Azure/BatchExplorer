
export interface GaugeConfig {
    min?: number;
    max?: number;
    showLabels?: boolean;
}

export const defaultOptions: GaugeConfig = {
    min: 0,
    max: 1,
    showLabels: true,
};
