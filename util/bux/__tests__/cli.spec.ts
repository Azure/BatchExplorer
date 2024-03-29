import * as util from "../util";
import * as shelljs from "shelljs";
import { createEnglishTranslations } from "../translation-functions";
import * as fs from "fs";

describe("CLI", () => {
    beforeEach(() => {
        // Suppress expected console warnings
        jest.spyOn(console, "warn").mockImplementation(() => {
            // no-op
        });
    });

    afterEach(() => jest.resetAllMocks());

    /* At present, Jest won't allow us to mock methods for reading and writing
     * JSON files because support of ES modules is lacking.
     */
    // test("configure", () => {
    //     jest.mock("../util", () => {
    //         const original = jest.requireActual("../util");
    //         return {
    //             __esModule: true,
    //             ...original,
    //             readJsonOrDefault: jest.fn(),
    //             saveJson: jest.fn(),
    //         };
    //     });
    //     jest.mock("../util", () => ({ saveJson: jest.fn() }));
    //     util.configure();
    //     expect(inquirer.prompt).toHaveBeenCalled();
    // });
    test("chmodx", () => {
        util.chmodx(["a", "b", "c"]);
        expect(shelljs.chmod).toHaveBeenCalledTimes(3);
    });

    //LOCALIZATION UNIT TESTS

    //Create empty directories to store the output files in
    const path1 = "./build/test-results/loc-results-1";
    const path2 = "./build/test-results/loc-results-2";
    const path3 = "./build/test-results/loc-results-3";

    fs.mkdir(path1, { recursive: true }, (err) => {
        if (err) throw err;
    });

    fs.mkdir(path2, { recursive: true }, (err) => {
        if (err) throw err;
    });

    fs.mkdir(path3, { recursive: true }, (err) => {
        if (err) throw err;
    });

    //Test that localization build script works correctly
    test("Localization", async () => {
        await util.buildTranslations(
            "./__tests__/loc-source",
            "./build/test-results/loc-results-1/resjson",
            "./build/test-results/loc-results-1/json",
            "lib.common"
        );
    });

    //Test that localization build script works correctly
    test("Localization with package name", async () => {
        await util.buildTranslations(
            "./__tests__/loc-source",
            "./build/test-results/loc-results-2/resjson",
            "./build/test-results/loc-results-2/json",
            "lib.common"
        );
    });

    //Check that the RESJSON file with the packageName parameter contains the package name in its contents
    test("Check if RESJSON file with packageName parameter contains the package name", () => {
        const data = fs.readFileSync(
            "./build/test-results/loc-results-2/resjson/resources.resjson"
        );
        expect(data.toString()).toContain("lib.common");
    });

    // Localization method should throw error due to duplicate keys
    // in files in the source directory
    test("Localization method should throw error", async () => {
        await expect(
            createEnglishTranslations(
                "./__tests__/loc-source-2",
                "./build/test-results/loc-results-3/resjson",
                "./build/test-results/loc-results-3/json"
            )
        ).rejects.toThrow(Error);

        // expect destination directory to be empty due to error
        const directoryContents = fs.readdirSync(
            "./build/test-results/loc-results-3"
        );
        expect(directoryContents.length).toBe(0);
    });
});
