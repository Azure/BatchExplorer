import tinycolor from "tinycolor2";
import { ChartColors } from "./chart-colors";
const blue = "#003f5c";
const red = "#aa3939";
const green = "#4caf50";
const yellow = "#ffa600";

function mix(color1: string, color2: string, percent: number): string {
    return tinycolor.mix(color1, color2, percent).toHexString();
}

describe("ChartColors", () => {
    let colors: ChartColors;

    beforeEach(() => {
        colors = new ChartColors([
            blue,
            red,
            green,
            yellow,
        ]);
    });

    it("first n color use the color provided", () => {
        expect(colors.get(0)).toEqual(blue);
        expect(colors.get(1)).toEqual(red);
        expect(colors.get(2)).toEqual(green);
        expect(colors.get(3)).toEqual(yellow);
    });

    it("first n color use does a mix of colors at 50%", () => {
        expect(colors.get(4)).toEqual(mix(blue, red, 50));
        expect(colors.get(5)).toEqual(mix(red, green, 50));
        expect(colors.get(6)).toEqual(mix(green, yellow, 50));
        expect(colors.get(7)).toEqual(mix(yellow, blue, 50));
    });

    it("does a mix of colors at 25% and 75%", () => {
        expect(colors.get(8)).toEqual(mix(blue, red, 25));
        expect(colors.get(9)).toEqual(mix(red, green, 25));
        expect(colors.get(10)).toEqual(mix(green, yellow, 25));
        expect(colors.get(11)).toEqual(mix(yellow, blue, 25));
        expect(colors.get(12)).toEqual(mix(blue, red, 75));
        expect(colors.get(13)).toEqual(mix(red, green, 75));
        expect(colors.get(14)).toEqual(mix(green, yellow, 75));
        expect(colors.get(15)).toEqual(mix(yellow, blue, 75));
    });

    it("does a mix of colors at 12.5% increments", () => {
        expect(colors.get(16)).toEqual(mix(blue, red, 12.5));
        expect(colors.get(17)).toEqual(mix(red, green, 12.5));
        expect(colors.get(18)).toEqual(mix(green, yellow, 12.5));
        expect(colors.get(19)).toEqual(mix(yellow, blue, 12.5));

        expect(colors.get(20)).toEqual(mix(blue, red, 37.5));
        expect(colors.get(21)).toEqual(mix(red, green, 37.5));
        expect(colors.get(22)).toEqual(mix(green, yellow, 37.5));
        expect(colors.get(23)).toEqual(mix(yellow, blue, 37.5));

        expect(colors.get(24)).toEqual(mix(blue, red, 62.5));
        expect(colors.get(25)).toEqual(mix(red, green, 62.5));
        expect(colors.get(26)).toEqual(mix(green, yellow, 62.5));
        expect(colors.get(27)).toEqual(mix(yellow, blue, 62.5));

        expect(colors.get(28)).toEqual(mix(blue, red, 87.5));
        expect(colors.get(29)).toEqual(mix(red, green, 87.5));
        expect(colors.get(30)).toEqual(mix(green, yellow, 87.5));
        expect(colors.get(31)).toEqual(mix(yellow, blue, 87.5));
    });
});
