import { GaugeLabel, GaugeLabels } from "./gauge-config";

export const presetSizes = {
    xsmall: 100,
    small: 150,
    medium: 200,
    large: 300,
};

export function percToDeg(perc) {
    return perc * 360;
}

export function percToRad(perc) {
    return degToRad(percToDeg(perc));
}

export function degToRad(deg) {
    return deg * Math.PI / 180;
}

export function invalidSizeMessage(value) {
    const sizes = Object.keys(presetSizes).join(",");
    return `Invalid size "${value}" for Gauge, use on of ${sizes} or a fixed number.`;
}

export function getLabelFor(labels: GaugeLabels, attr: keyof GaugeLabels, defaultValue: any): GaugeLabel {
    if (labels && labels[attr]) {
        return Object.assign({}, { value: defaultValue }, labels[attr]);

    } else {
        return {
            value: defaultValue,
        };
    }
}
