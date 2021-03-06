module.exports = {
    ignorePatterns: [
        "node_modules/**/*",
        "**/node_modules/**/*",
        "lib/**/*",
        "build/**/*",
        "python/**/*",
        "docs/**/*",
        "data/**/*"
    ],
    env: {
        browser: true,
        es6: true,
        node: true
    },
    overrides: [
        /*
         * TYPESCRIPT FILES
         */
        {
            files: ["src/**/*.ts"],
            extends: [
                ".eslintrc.desktop.json",
                "prettier"
            ],
            plugins: [
                "@angular-eslint/eslint-plugin",
                "@angular-eslint/eslint-plugin-template",
                "@typescript-eslint"
            ],
            rules: {
                "@angular-eslint/component-selector": [
                    "error",
                    {
                        type: "element",
                        prefix: ["bl", "be"],
                        style: "kebab-case"
                    }
                ],
                "@angular-eslint/directive-selector": [
                    "error",
                    {
                        type: "attribute",
                        prefix: ["bl", "be"],
                        style: "camelCase"
                    }
                ],
                "@angular-eslint/no-forward-ref": "off",
                "@angular-eslint/no-input-rename": "warn",
                "@angular-eslint/use-lifecycle-interface": "warn",
                "@typescript-eslint/no-var-requires": "warn",
                "@typescript-eslint/no-empty-interface": "warn",
                "@typescript-eslint/ban-ts-comment": "warn"
            }
        },
        /*
         * COMPONENT TEMPLATES
         */
        {
            files: ["src/**/*.html"],
            extends: [
                "plugin:@angular-eslint/template/recommended"
            ],
            rules: {
                "@angular-eslint/template/use-track-by-function": "warn",
                "max-len": "off"
            }
        },
        /*
         * @BATCH-FLASK
         */
        {
            files: ["src/@batch-flask/**/*.ts"],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        paths: [
                            {
                                name: "app",
                                message: "Importing modules in @batch-flask from app/* is forbidden"
                            },
                            {
                                name: "common",
                                message: "Importing modules in @batch-flask from common/* is forbidden"
                            }
                        ],
                        patterns: ["app/*", "common/*"]
                    }
                ]
            }
        },
        /*
         * NODE SCRIPTS
         */
        {
            files: ["scripts/**/*.ts", "config/**/*.ts"],
            extends: [
                ".eslintrc.desktop.json",
                "prettier"
            ],
            parserOptions: {
                project: [
                    "tsconfig.eslint.json"
                ],
                tsconfigRootDir: __dirname,
                sourceType: "script",
                createDefaultProgram: false
            },
            rules: {
                "@typescript-eslint/no-var-requires": "off",
                "no-console": "off",
                "no-constant-condition": ["error", { "checkLoops": false }]
            }
        },
        {
            files: [
                "scripts/**/*.js",
                "config/**/*.js",
                "test/client/**/*.js",
                "test/spectron/run.js",
                "karma.conf.js"],
            extends: [
                "eslint:recommended",
                "prettier"
            ],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
                "no-console": "off",
                "no-constant-condition": ["error", { "checkLoops": false }]
            }
        }
    ]
};
