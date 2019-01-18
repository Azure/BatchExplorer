import { ServerError } from "@batch-flask/core";
import { of } from "rxjs";
import { File } from "../file.model";
import { FileLoader } from "./file-loader";

const file1 = new File({ name: "foo.ts", properties: { contentLength: 45 } } as any);
const file2 = new File({ name: "foo.ts", properties: { contentLength: 124 } } as any);

describe("FileLoader", () => {
    let fileLoader: FileLoader;
    let fsSpy;
    let file: File | null;
    let propertyGetterSpy: jasmine.Spy;
    let contentSpy: jasmine.Spy;

    beforeEach(() => {
        file = file1;
        fsSpy = {
            ensureDir: jasmine.createSpy("ensureDir").and.returnValue(Promise.resolve(true)),
            saveFile: jasmine.createSpy("saveFile").and.returnValue(Promise.resolve(true)),
        };
        propertyGetterSpy = jasmine.createSpy("propertiesGetter").and.callFake(() => of(file));
        contentSpy = jasmine.createSpy("content").and.returnValue(of({ content: "export const foo = 123;" }));
        fileLoader = new FileLoader({
            filename: "foo.ts",
            source: "fake-source",
            groupId: "fake-group",
            fs: fsSpy,
            properties: propertyGetterSpy,
            content: contentSpy,
        });
    });

    it("trigger the property load when subscribing to .properties", () => {
        expect(propertyGetterSpy).toHaveBeenCalledTimes(0);
        let value: File | ServerError;
        const sub = fileLoader.properties.subscribe((x) => value = x);
        expect(propertyGetterSpy).toHaveBeenCalledTimes(1);
        expect(value).toEqual(file1);
        sub.unsubscribe();
    });

    it("gets the new properties while subscribed to .properties", () => {
        let value: File | ServerError;
        const sub = fileLoader.properties.subscribe(x => value = x);
        expect(propertyGetterSpy).toHaveBeenCalledTimes(1);
        expect(value).toEqual(file1);

        file = file2;
        fileLoader.refreshProperties().subscribe();
        expect(value).toEqual(file2);
        sub.unsubscribe();
    });

    it("properties doesn't notify when the file hasn't changed", () => {
        const subSpy = jasmine.createSpy("propertiesChanged");
        const sub = fileLoader.properties.subscribe(subSpy);
        expect(subSpy).toHaveBeenCalledTimes(1);
        expect(subSpy).toHaveBeenCalledWith(file1);

        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(1);

        file = file2;
        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(2);
        expect(subSpy).toHaveBeenCalledWith(file2);
        sub.unsubscribe();
    });

    it("fileChanged only gets triggered for following events", () => {
        const subSpy = jasmine.createSpy("propertiesChanged");
        fileLoader.refreshProperties();
        const sub = fileLoader.fileChanged.subscribe(subSpy);
        expect(subSpy).toHaveBeenCalledTimes(0);

        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(0);

        file = file2;
        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(1);
        expect(subSpy).toHaveBeenCalledWith(file2);
        sub.unsubscribe();
    });

    it("getProperties only gets triggered once with the current value", () => {
        const subSpy = jasmine.createSpy("propertiesChanged");
        const sub = fileLoader.getProperties().subscribe(subSpy);
        expect(subSpy).toHaveBeenCalledTimes(1);
        expect(subSpy).toHaveBeenCalledWith(file1);

        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(1);

        file = file2;
        fileLoader.refreshProperties().subscribe();
        expect(subSpy).toHaveBeenCalledTimes(1);
        sub.unsubscribe();
    });

    it("download a file", async () => {
        await fileLoader.download("/some/local/path/foo.ts").toPromise();

        expect(fsSpy.saveFile).toHaveBeenCalledOnce();
        expect(fsSpy.saveFile).toHaveBeenCalledWith("/some/local/path/foo.ts", "export const foo = 123;");
    });
});
