import { CloudPathUtils } from "app/utils";

describe("CloudPathUtils", () => {
    it("#join", () => {
        expect(CloudPathUtils.join("path1")).toEqual("path1");
        expect(CloudPathUtils.join("path1", "path2")).toEqual("path1/path2");
        expect(CloudPathUtils.join("path1/", "path2/")).toEqual("path1/path2");
        expect(CloudPathUtils.join("path1/path2", "path3")).toEqual("path1/path2/path3");
    });

    it("#normalize", () => {
        expect(CloudPathUtils.normalize("path1")).toEqual("path1");
        expect(CloudPathUtils.normalize("path1\\path2")).toEqual("path1/path2");
        expect(CloudPathUtils.normalize("path1\\path2/path3")).toEqual("path1/path2/path3");
    });

    it("#dirname", () => {
        expect(CloudPathUtils.dirname("file.txt")).toEqual("");
        expect(CloudPathUtils.dirname("path1/file.txt")).toEqual("path1");
        expect(CloudPathUtils.dirname("path1/path2/file.txt")).toEqual("path1/path2");
    });

    it("#asBaseDirectory", () => {
        expect(CloudPathUtils.asBaseDirectory("path1")).toEqual("path1/");
        expect(CloudPathUtils.asBaseDirectory("path1\\path2")).toEqual("path1/path2/");
        expect(CloudPathUtils.asBaseDirectory("path1\\path2/path3")).toEqual("path1/path2/path3/");
    });
});
