module.exports = {
    ignorePatterns: [
        "node_modules/**/*",
        "/lib/**/*",
        "/build/**/*",
        "/python/**/*",
        "/docs/**/*",
        "/data/**/*"
    ],
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        ".eslintrc.desktop.json"
    ],
    overrides: [
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
                "karma.conf.js"
            ],
            extends: [
                "eslint:recommended"
            ],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
                "no-console": "off",
                "no-constant-condition": ["error", { "checkLoops": false }]
            }
        }
    ]
};
