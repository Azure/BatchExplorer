const Jasmine = require("jasmine");
const SpecReporter = require("jasmine-spec-reporter");
const path = require("path");

const jrunner = new Jasmine();
jrunner.env.clearReporters();                                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new SpecReporter());                            // add jasmine-spec-reporter
jrunner.loadConfigFile(path.join(__dirname, "jasmine.json"));       // load jasmine.json configuration
jrunner.execute();
