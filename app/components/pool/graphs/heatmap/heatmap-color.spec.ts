import { ColorUtils } from "app/utils";
import { HeatmapColor } from "./heatmap-color";

const stateTree = [
    { state: "idle", color: "#aaaaaa" },
    { state: "running", color: "#888888" },
    {
        category: "transition", label: "", color: "#777777", states: [
            { state: "rebooting", color: "#aaa111" },
            { state: "starting", color: "#aaa222" },
        ],
    },
    {
        category: "error", label: "", color: "#5555555", states: [
            { state: "startTaskFailed", color: "#bbb111" },
            { state: "unusable", color: "#bbb222" },
        ],
    },
];

describe("Statecounter", () => {
    let colors: HeatmapColor;
    beforeEach(() => {
        colors = new HeatmapColor(stateTree as any);
    });

    it("should show the base color by default for states", () => {
        expect(colors.get("idle")).toEqual("#aaaaaa");
        expect(colors.get("running")).toEqual("#888888");
    });

    it("substate should have category color by default", () => {
        expect(colors.get("starting")).toEqual("#777777");
        expect(colors.get("rebooting")).toEqual("#777777");

        expect(colors.get("startTaskFailed")).toEqual("#5555555");
        expect(colors.get("unusable")).toEqual("#5555555");
    });

    describe("when highlighting a state", () => {
        beforeEach(() => {
            colors.updateColors("idle");
        });

        it("should not change the highlighted state", () => {
            expect(colors.get("idle")).toEqual("#aaaaaa");
        });

        it("should show other state lighten ", () => {
            expect(colors.get("running")).toEqual(ColorUtils.shadeColor("#888888", 0.8));
            expect(colors.get("starting")).toEqual(ColorUtils.shadeColor("#777777", 0.8));
            expect(colors.get("rebooting")).toEqual(ColorUtils.shadeColor("#777777", 0.8));
            expect(colors.get("startTaskFailed")).toEqual(ColorUtils.shadeColor("#5555555", 0.8));
            expect(colors.get("unusable")).toEqual(ColorUtils.shadeColor("#5555555", 0.8));
        });
    });

    describe("when highlighting a category", () => {
        beforeEach(() => {
            colors.updateColors("error");
        });

        it("should show the real color of substates", () => {
            expect(colors.get("startTaskFailed")).toEqual("#bbb111");
            expect(colors.get("unusable")).toEqual("#bbb222");
        });

        it("should show other state lighten ", () => {
            expect(colors.get("idle")).toEqual(ColorUtils.shadeColor("#aaaaaa", 0.8));
            expect(colors.get("running")).toEqual(ColorUtils.shadeColor("#888888", 0.8));
            expect(colors.get("starting")).toEqual(ColorUtils.shadeColor("#777777", 0.8));
            expect(colors.get("rebooting")).toEqual(ColorUtils.shadeColor("#777777", 0.8));
        });
    });
});
