/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const { pathsToModuleNameMapper } = require("ts-jest");

const { readFileSync } = require("fs");
const path = require("path");

const combinedResourceStrings = getCombinedResourceStrings();

module.exports = {
    /**
     * Creates a Jest configuration object with optional overrides.
     *
     * Note that this performs a shallow merge not a deep merge, so only
     * top-level properties may be overridden.
     *
     * @param projectName A unique name for this project
     *
     * @param tsconfig Optional imported tsconfig.json (ie: require("./tsconfig"))
     *                 which will be used to generate module mappings
     *
     * @param overrides Optional jest configuration options which will be
     *                  merged into the base config.
     */
    createConfig: (projectName, tsconfig, overrides) => {
        if (!overrides) {
            overrides = {};
        }

        const baseConfig = {
            // use "js-with-ts" preset to to transform some esm modules .js file to cjs
            // for example, monaco-editor, which is a esm module, will be transformed to cjs
            // so that jest can run it.
            // https://stackoverflow.com/questions/61781271/jest-wont-transform-the-module-syntaxerror-cannot-use-import-statement-outsi
            preset: "ts-jest/presets/js-with-ts",
            testEnvironment: "node",
            maxWorkers: "50%",
            testMatch: ["<rootDir>/src/**/__tests__/**/*.spec.(ts|tsx|js|jsx)"],
            coverageDirectory: "<rootDir>/build/coverage",
            coverageReporters: [
                "text",
                ["html", { subdir: "html" }],
                ["cobertura", { file: "cobertura.xml" }],
            ],
            moduleDirectories: ["src", "node_modules"],
            reporters: [
                "default",
                [
                    "jest-junit",
                    {
                        suiteName: projectName,
                        outputName: "TEST-" + projectName + ".xml",
                        outputDirectory: "build/test-results",
                        ancestorSeparator: " > ",
                        suiteNameTemplate: "{filename}",
                    },
                ],
            ],
            globals: {
                "ts-jest": {
                    // js-with-ts preset require "allowJs": true in tsconfig.json
                    // so making a "tsconfig.test.json" to override it
                    tsconfig: "config/tsconfig.test.json",
                    // Greatly speed up tests at the expense of type checking
                    isolatedModules: true,
                },
                __TEST_RESOURCE_STRINGS: combinedResourceStrings,
            },
            transform: {
                "^.+\\.tsx?$": [
                    "ts-jest",
                    {
                        diagnostics: {
                            // Squelch a warning with outputting ES6 modules (in tsconfig.json)
                            ignoreCodes: [151001],
                        },
                    },
                ],
            },
            // transform monaco-editor to cjs
            transformIgnorePatterns: [
                "node_modules/(?!(monaco-editor)).+\\.js$",
            ],
        };

        if (
            tsconfig &&
            tsconfig.compilerOptions &&
            tsconfig.compilerOptions.paths
        ) {
            // If we were given a tsconfig, use it to generate module mappings
            baseConfig.moduleNameMapper = pathsToModuleNameMapper(
                tsconfig.compilerOptions.paths,
                { prefix: "<rootDir>/" }
            );
        } else {
            baseConfig.moduleNameMapper = {};
        }

        // Force usage of the CommonJS versions since Jest
        // currently doesn't support ES modules

        // FluentUI and legacy office-ui-fabric-react
        baseConfig.moduleNameMapper["office-ui-fabric-react/lib/(.*)$"] =
            "office-ui-fabric-react/lib-commonjs/$1";
        baseConfig.moduleNameMapper["@fluentui/react/lib/(.*)$"] =
            "@fluentui/react/lib-commonjs/$1";

        // Local packages
        baseConfig.moduleNameMapper["@azure/bonito-core/lib/(.*)$"] =
            "@azure/bonito-core/lib-cjs/$1";
        baseConfig.moduleNameMapper["@azure/bonito-ui/lib/(.*)$"] =
            "@azure/bonito-ui/lib-cjs/$1";
        baseConfig.moduleNameMapper["@batch/ui-react/lib/(.*)$"] =
            "@batch/ui-react/lib-cjs/$1";
        baseConfig.moduleNameMapper["@batch/ui-service/lib/(.*)$"] =
            "@batch/ui-service/lib-cjs/$1";

        // css files
        baseConfig.moduleNameMapper["^.+\\.css$"] = path.join(
            __dirname,
            "../mock-style.js"
        );

        return Object.assign({}, baseConfig, overrides);
    },
    getCombinedResourceStrings: getCombinedResourceStrings,
};

function getCombinedResourceStrings() {
    const resourceStrings = [
        require(
            path.join(
                __dirname,
                "../../packages/bonito-core/resources/i18n/json/resources.en.json"
            )
        ),
        require(
            path.join(
                __dirname,
                "../../packages/bonito-ui/resources/i18n/json/resources.en.json"
            )
        ),
        require(
            path.join(
                __dirname,
                "../../packages/service/resources/i18n/json/resources.en.json"
            )
        ),
        require(
            path.join(
                __dirname,
                "../../packages/react/resources/i18n/json/resources.en.json"
            )
        ),
        require(
            path.join(
                __dirname,
                "../../packages/playground/resources/i18n/json/resources.en.json"
            )
        ),
        require(
            path.join(__dirname, "../../web/resources/i18n/resources.en.json")
        ),
    ];

    const allResourceStrings = {};
    resourceStrings.forEach((strings) => {
        Object.assign(allResourceStrings, strings);
    });

    return allResourceStrings;
}
