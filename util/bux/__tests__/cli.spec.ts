import * as util from "../util";
import * as shelljs from "shelljs";

describe("CLI", () => {
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
});
