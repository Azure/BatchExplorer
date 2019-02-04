import { MockUserConfigurationService } from "@batch-flask/core/testing";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";
import { TextFileViewerComponent } from "../text-file-viewer";
import { FileTypeAssociationService } from "./file-type-association.service";

describe("FileTypeAssociationService", () => {
    let service: FileTypeAssociationService;
    let settingsSpy: MockUserConfigurationService;

    beforeEach(() => {
        settingsSpy = new MockUserConfigurationService({});
        service = new FileTypeAssociationService(settingsSpy as any);
    });

    it("gets the default types", () => {
        expect(service.getType("foo.ts")).toEqual("text");
        expect(service.getType("foo.cs")).toEqual("text");
        expect(service.getType("foo.txt")).toEqual("log");
        expect(service.getType("foo.png")).toEqual("image");
        expect(service.getType("foo.unk2")).toEqual(null);
    });

    it("includes user types", () => {
        settingsSpy.patch({
            fileAssociations: [
                {extension: ".custTxt", type: "text"},
                {extension: ".custImage", type: "image"},
                {extension: ".custLog", type: "log"},
                {extension: ".custInvalid", type: "invalid"},
                {extension: ".custNull", type: null},
            ],
        });

        expect(service.getType("foo.custTxt")).toEqual("text");
        expect(service.getType("foo.custImage")).toEqual("image");
        expect(service.getType("foo.custLog")).toEqual("log");
        expect(service.getType("foo.custInvalid")).toEqual(null);
        expect(service.getType("foo.custNull")).toEqual(null);
    });

    it("gets component associated with the given type", () => {
        expect(service.getComponentType("text")).toEqual(TextFileViewerComponent);
        expect(service.getComponentType("log")).toEqual(LogFileViewerComponent);
        expect(service.getComponentType("image")).toEqual(ImageFileViewerComponent);
    });

    it("includes types register later", () => {
        service.registerViewer({
            name: "fake-viewer",
            component: "fake" as any,
            extensions: [".fake1", ".fake2", ".json"],
        });

        expect(service.getType("foo.fake1")).toEqual("fake-viewer");
        expect(service.getType("foo.fake2")).toEqual("fake-viewer");
        expect(service.getType("foo.json")).toEqual("fake-viewer");
    });

    fit("It creates a new instance with local overrides", () => {
        service.registerViewer({
            name: "fake-viewer",
            component: "fake" as any,
            extensions: [".fake1", ".fake2"],
        });

        expect(service.getType("foo.fake1")).toEqual("fake-viewer");
        expect(service.getType("foo.fake2")).toEqual("fake-viewer");
        expect(service.getType("foo.json")).toEqual("text");

        const local = service.withLocalAssociations([{extension: ".json", type: "fake-viewer"}]);
        expect(local.getType("foo.fake1")).toEqual("fake-viewer");
        expect(local.getType("foo.fake2")).toEqual("fake-viewer");
        expect(local.getType("foo.json")).toEqual("fake-viewer");
    });
});
