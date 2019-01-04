const Jasmine = require("jasmine");
const { SpecReporter } = require("jasmine-spec-reporter");

const jrunner = new Jasmine(undefined);
jrunner.env.clearReporters();                                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new SpecReporter({
    spec: {
        displayStacktrace: true,
    }
}));                            // add jasmine-spec-reporter
jrunner.loadConfig({
    spec_dir: ".",
    spec_files: [
        "test/spectron/**/*.spec.ts",
    ],
    helpers: [
        "test/client/ts-node.helper.js",
    ],
    stopSpecOnExpectationFailure: true,
    random: false,
});

jrunner.execute();
