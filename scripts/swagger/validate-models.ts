// tslint:disable:no-console
import "../../src/client/init";

import * as path from "path";
process.env.NODE_PATH = process.env.NODE_PATH + ";" + path.join(__dirname, "../..");
// tslint:disable-next-line:no-var-requires
require("module").Module._initPaths();

import "reflect-metadata";
import "zone.js";

import fetch from "node-fetch";
import * as models from "../../app/models";
import { metadataForCtr } from "../../src/@batch-flask/core/record/helpers";

const dataPlaneVersion = "2018-08-01.7.0";

interface SwaggerRef {
    $ref: string;
}

interface SwaggerProperty {
    type: string | SwaggerRef;
    title: string;
}

interface SwaggerProperties {
    [name: string]: SwaggerProperty;
}

interface SwaggerDefinition {
    properties?: SwaggerProperties;
    enum?: string[];
}

async function getSpecs() {
    const baseUrl = `https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/batch`;
    const url = `${baseUrl}/data-plane/Microsoft.Batch/stable/${dataPlaneVersion}/BatchService.json`;
    const response = await fetch(url);
    return response.json();
}

async function getMapping() {
    const specs = await getSpecs();
    console.log("Specs");

    const mappings = [];

    for (const name of Object.keys(models)) {
        if (name in specs.definitions) {
            mappings.push({
                name,
                model: models[name],
                definition: specs.definitions[name],
            });
        } else {
            // console.log(name);
        }
    }
    return mappings;
}

interface ValidationError {
    name: string;
    message: string;
}

class SwaggerModelValidator {
    public errors: ValidationError[] = [];

    constructor(public name: string, private model, private definition: SwaggerDefinition) {

    }

    public validate() {

        if (this.model.prototype) {
            try {
                const metadata = metadataForCtr(this.model);
                this.checkMissingProperties(new Set(Object.keys(metadata)), this.definition.properties);
            } catch (e) {
                this.addError("Invalid model. Make sure extends Record and has @Model decorator");
            }
        } else {
            // Enum
            this.validateEnum();
        }
    }

    private addError(message: string) {
        this.errors.push({ name: this.name, message });
        console.warn(`Error: ${this.name} > ${message}`);
    }

    private checkMissingProperties(properties: Set<string>, swaggerProperties: SwaggerProperties) {
        for (const name of Object.keys(swaggerProperties)) {
            if (!properties.has(name)) {
                console.log("Missing property", name);
                this.addError(`Missing property ${name}`);
            }
        }
    }

    private validateEnum() {
        const values: string[] = (Object as any).values(this.model);
        const swaggerValues = this.definition.enum;
        for (const value of swaggerValues) {
            if (!values.includes(value)) {
                this.addError("Enum is missing property");
            }
        }
    }
}

async function run() {
    const mappings = await getMapping();

    let errors = [];
    for (const mapping of mappings) {
        const validator = new SwaggerModelValidator(mapping.name, mapping.model, mapping.definition);
        validator.validate();
        errors = errors.concat(validator.errors);
        // return;
    }

    if (errors) {
        console.warn(`\nValidation completed with ${errors.length} errors`);
        process.exit(2);
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
