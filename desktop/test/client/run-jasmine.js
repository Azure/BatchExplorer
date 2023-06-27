const path = require("path");
process.env.NODE_PATH = path.join(__dirname, "../../src");
require("module").Module._initPaths();

const Jasmine = require("jasmine");
const { SpecReporter } = require("jasmine-spec-reporter");

const jrunner = new Jasmine();
jrunner.env.clearReporters();                                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new SpecReporter({
    spec: {
        displayStacktrace: true,
    }
}));                            // add jasmine-spec-reporter
jrunner.loadConfigFile(path.join(__dirname, "jasmine.json"));       // load jasmine.json configuration
jrunner.execute();
