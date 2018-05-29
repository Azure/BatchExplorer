import * as core from "../core/subprocess";
import * as pythonExecutable from "./python-executable";

describe("python-executable", () => {

    it("try multiple python should find the right version", (done) => {
        (core as any).execCommand = jasmine.createSpy("execCommand").and.callFake((command) => {
            switch (command) {
                case "/custom/path/python --version":
                    return Promise.reject("Not found command");
                case "python3 --version":
                    return Promise.resolve({ stdout: "Python 3.4.1" });
                case "python --version":
                    return Promise.resolve({ stdout: "Python 3.6.2" });
                default:
                    return Promise.reject("Unkown python...");
            }
        });

        const options = ["/custom/path/python", "python3", "python", "otherPython"];
        pythonExecutable.tryMultiplePythons(options).then((path) => {
            expect(path).toBe("python");
            done();
        }).catch((e) => {
            expect(false).toBe(true, `Should not have an error ${e.message}`);
            done();
        });
    });
});
