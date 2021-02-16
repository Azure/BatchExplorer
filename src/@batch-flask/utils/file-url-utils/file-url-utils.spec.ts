import { FileUrlUtils } from "./file-url-utils";

/* eslint-disable max-len */
describe("FileUrlUtils", () => {
    it("get file name from url", () => {
        const out = FileUrlUtils.getFileName(
            "https://prodtest1.brazilsouth.batch.azure.com/jobs/a/tasks/004-file/files/stdout.txt");
        expect(out).toEqual("stdout.txt");
    });

    it("get file extension from url", () => {
        const out = FileUrlUtils.getFileExtension(
            "https://prodtest1.brazilsouth.batch.azure.com/jobs/a/tasks/004-file/files/stdout.txt");
        expect(out).toEqual("txt");
    });
});
