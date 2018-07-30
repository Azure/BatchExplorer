import { CssColor, ThemeElement } from "./theme-core";

class InputColors extends ThemeElement<any> {
    @CssColor() public background: string;
    @CssColor() public text: string;
}

class MainTheme extends ThemeElement<any> {
    @CssColor() public basic: string;
    @CssColor("custom-name") public customName: string;
    @CssColor() public input: InputColors;
}

const fullTheme = new MainTheme({
    "basic": "red",
    "custom-name": "blue",
    "input": {
        background: "green",
        text: "white",
    },
});

const partialTheme = new MainTheme({
    "custom-name": "yellow",
    "input": {
        background: "orange",
    },
});

describe("ThemeCore", () => {
    it("create a theme from definition", () => {
        expect(fullTheme.basic).toEqual("red");
        expect(fullTheme.customName).toEqual("blue");
        expect(fullTheme.input.background).toEqual("green");
        expect(fullTheme.input.text).toEqual("white");
    });

    it("merges theme into an empty theme", () => {
        const theme = new MainTheme({}).merge(fullTheme);

        expect(theme.basic).toEqual("red");
        expect(theme.customName).toEqual("blue");
        expect(theme.input.background).toEqual("green");
        expect(theme.input.text).toEqual("white");
    });

    it("merges a partial theme", () => {
        const theme = new MainTheme({}).merge(fullTheme).merge(partialTheme);

        expect(theme.basic).toEqual("red");
        expect(theme.customName).toEqual("yellow");
        expect(theme.input.background).toEqual("orange");
        expect(theme.input.text).toEqual("white");
    });
});
