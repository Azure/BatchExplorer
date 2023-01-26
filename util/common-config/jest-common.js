/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const { pathsToModuleNameMapper } = require("ts-jest");

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
            preset: "ts-jest",
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
                    diagnostics: {
                        // Squelch a warning with outputting ES6 modules (in tsconfig.json)
                        ignoreCodes: [151001],
                    },
                },
                // Greatly speed up tests at the expense of type checking
                isolatedModules: true,
            },
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
        baseConfig.moduleNameMapper["@batch/arm-batch-rest/lib/(.*)$"] =
            "@batch/arm-batch-rest/lib-cjs/$1";
        baseConfig.moduleNameMapper["@batch/ui-common/lib/(.*)$"] =
            "@batch/ui-common/lib-cjs/$1";
        baseConfig.moduleNameMapper["@batch/ui-react/lib/(.*)$"] =
            "@batch/ui-react/lib-cjs/$1";
        baseConfig.moduleNameMapper["@batch/ui-service/lib/(.*)$"] =
            "@batch/ui-service/lib-cjs/$1";

        return Object.assign({}, baseConfig, overrides);
    },
};
