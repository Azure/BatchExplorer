import { isObservable, of } from "rxjs";
import { FileNavigator } from "./file-navigator";

describe("FileNavigator", () => {
    let navigator: FileNavigator;
    let deleteSpy: jasmine.Spy;
    let uploadSpy: jasmine.Spy;

    beforeEach(() => {
        uploadSpy = jasmine.createSpy("upload").and.returnValue(of(null));
        deleteSpy = jasmine.createSpy("delete").and.returnValue(of(null));

        navigator = new FileNavigator({
            getter: null,
            getFile: null,
            params: { custom: "param-1" },
            delete: deleteSpy,
            upload: uploadSpy,
        });
    });

    it("upload file", () => {
        const obs = navigator.uploadFile("some/folder/file.json", "~/data/some/file.json");

        expect(uploadSpy).toHaveBeenCalledOnce();
        expect(uploadSpy).toHaveBeenCalledWith("some/folder/file.json", "~/data/some/file.json");

        expect(isObservable(obs)).toBe(true);
    });

    it("delete file", () => {
        const obs = navigator.deleteFile("some/folder/file.json");

        expect(deleteSpy).toHaveBeenCalledOnce();
        expect(deleteSpy).toHaveBeenCalledWith("some/folder/file.json");

        expect(isObservable(obs)).toBe(true);
    });
});
