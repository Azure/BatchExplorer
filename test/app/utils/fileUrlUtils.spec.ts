import { FileType } from "app/models";
import { Constants, FileUrlUtils } from "app/utils";

// tslint:disable:max-line-length
describe("FileUrlUtils", () => {
    it("parsing a node start task file url should return the right file type construct", () => {
        const out = FileUrlUtils.parseRelativePath(
            "https://prodtest1.brazilsouth.batch.azure.com/pools/a/nodes/tvm-57200098_15-20170118t183619z/files/startup\stdout.txt");
        const expected: FileType = {
            containerName: "a",
            entityName: "tvm-57200098_15-20170118t183619z",
            file: "startup\stdout.txt",
            type: Constants.FileSourceTypes.Pool,
        };
        expect(out).toEqual(expected);
    });

    it("parsing a task file url should return the right file type construct", () => {
        const out = FileUrlUtils.parseRelativePath(
            "https://prodtest1.brazilsouth.batch.azure.com/jobs/a/tasks/004-file/files/stdout.txt");
        const expected: FileType = {
            containerName: "a",
            entityName: "004-file",
            file: "stdout.txt",
            type: Constants.FileSourceTypes.Job,
        };
        expect(out).toEqual(expected);
    });

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
