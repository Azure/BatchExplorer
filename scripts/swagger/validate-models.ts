// tslint:disable:no-console
import "../../src/client/init";

import * as path from "path";
process.env.NODE_PATH = process.env.NODE_PATH + ";" + path.join(__dirname, "../..");
// tslint:disable-next-line:no-var-requires
require("module").Module._initPaths();

import "reflect-metadata";
import "zone.js";

import * as moment from "moment";
import fetch from "node-fetch";
import * as models from "../../app/models";
import { metadataForCtr } from "../../src/@batch-flask/core/record/helpers";

const dataPlaneVersion = "2018-08-01.7.0";

interface SwaggerProperty {
    type: "string" | "integer" | "boolean" | "array" | "number" | undefined;
    format: "date-time" | "duration" | "double" | undefined;
    $ref: string | undefined;
    title: string;
}

interface SwaggerProperties {
    [name: string]: SwaggerProperty;
}

interface SwaggerDefinition {
    properties?: SwaggerProperties;
    enum?: string[];
}

const nameMapping = [
    { swagger: "TaskContainerExecutionInformation", app: "TaskContainerExecutionInfo" },
    { swagger: "TaskFailureInformation", app: "FailureInfo" },
    { swagger: "OSDisk", app: "PoolOSDisk" },
    { swagger: "CloudTask", app: "Task" },
    { swagger: "CloudJob", app: "Job" },
    { swagger: "CloudPool", app: "Pool" },
    { swagger: "ComputeNode", app: "Node" },
    { swagger: "TaskCounts", app: "JobTaskCounts" },
    { swagger: "ExitConditions", app: "TaskExitConditions" },
    { swagger: "StartTaskInformation", app: "StartTaskInfo" },
    { swagger: "OutputFile", app: "TaskOutputFile" },
    { swagger: "OutputFileDestination", app: "TaskOutputFileDestination" },
    { swagger: "OutputFileBlobContainerDestination", app: "TaskOutputFileContainer" },
    { swagger: "OutputFileUploadOptions", app: "TaskOutputFileUploadOptions" },
];

const swaggerMappings = {};
for (const mapping of nameMapping) {
    swaggerMappings[mapping.swagger] = mapping.app;
}

const appMappings = {};
for (const mapping of nameMapping) {
    appMappings[mapping.app] = mapping.swagger;
}

async function getSpecs() {
    const baseUrl = `https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/batch`;
    const url = `${baseUrl}/data-plane/Microsoft.Batch/stable/${dataPlaneVersion}/BatchService.json`;
    const response = await fetch(url);
    return response.json();
}

async function getMapping() {
    const specs = await getSpecs();

    const mappings = [];

    for (const name of Object.keys(specs.definitions)) {
        if (name in models) {
            mappings.push({
                name,
                model: models[name],
                definition: specs.definitions[name],
            });
        } else if (name in swaggerMappings && models[swaggerMappings[name]]) {
            mappings.push({
                name,
                model: models[swaggerMappings[name]],
                definition: specs.definitions[name],
            });
        } else {
            if (!name.endsWith("Result") && !name.endsWith("Parameter")) {
                console.log("\t" + name);
            }
        }
    }

    return { mappings, specs: new SwaggerSpecs(specs) };
}

interface ValidationError {
    name: string;
    message: string;
}

class SwaggerModelValidator {
    public errors: ValidationError[] = [];

    constructor(
        private specs: SwaggerSpecs,
        public modelName: string,
        private model,
        private definition: SwaggerDefinition) {

    }

    public validate() {

        if (this.model.prototype) {
            let metadata;
            try {
                metadata = metadataForCtr(this.model);
            } catch (e) {
                this.addError("Invalid model. Make sure extends Record and has @Model decorator");
            }
            if (metadata) {
                this.checkMissingProperties(new Set(Object.keys(metadata)), this.definition.properties);
                this.checkPropertyTypes(metadata);
            }
        } else {
            // Enum
            this.validateEnum();
        }
    }

    private addError(message: string) {
        this.errors.push({ name: this.modelName, message });
        console.warn(`Error: ${this.modelName} > ${message}`);
    }

    private checkMissingProperties(properties: Set<string>, swaggerProperties: SwaggerProperties) {
        for (const name of Object.keys(swaggerProperties)) {
            if (!properties.has(name)) {
                this.addError(`Missing property ${name}`);
            }
        }
    }

    private checkPropertyTypes(metadata) {
        for (const name of Object.keys(metadata)) {
            const swaggerProperty = this.definition.properties[name];
            if (!swaggerProperty) {
                // this.addPropertyError(name, `Swagger is missing property`);
                continue;
            }
            const swaggerType = swaggerProperty.type;
            const property = metadata[name];
            const type = property.type;

            if (swaggerType === "string" && swaggerProperty.format === "date-time") {
                if (type !== Date) {
                    this.addPropertyError(name, `Expected type to be a date but was ${type}`);
                }
            } else if (swaggerType === "string" && swaggerProperty.format === "duration") {
                if (type !== moment.duration) {
                    this.addPropertyError(name, `Expected type to be a duration but was ${type}`);
                }
            } else if (swaggerType === "string") {
                if (type !== String) {
                    this.addPropertyError(name, `Expected type to be a string but was ${type}`);
                }
            } else if (swaggerType === "integer" || swaggerType === "number") {
                if (type !== Number) {
                    this.addPropertyError(name, `Expected type to be a number but was ${type}`);
                }
            } else if (swaggerType === "boolean") {
                if (type !== Boolean) {
                    this.addPropertyError(name, `Expected type to be a boolean but was ${type}`);
                }
            } else if (swaggerType === "array") {
                if (!property.list) {
                    this.addPropertyError(name, `Expected type to be a array but wasn't defined as a list. ${property}`
                        + `Check it has the @ListProp property not @Prop`);
                }
                // TODO-TIM check array type
            } else if (swaggerProperty.$ref) {
                const refTypeName = swaggerProperty.$ref.replace("#/definitions/", "");
                const nestedType = this.specs.getDefinition(refTypeName);
                if (nestedType.enum) {
                    if (type !== String) {
                        this.addPropertyError(name, `Expected type to be a enum ${refTypeName} but was ${type}`);
                    }
                } else {
                    try {
                        const modelCls = getModel(refTypeName);
                        if (modelCls !== property.type) {
                            this.addPropertyError(name,
                                `Expected type to be of type ${refTypeName} but was ${property.cls}`);
                        }
                    } catch (e) {
                        this.addPropertyError(name, e.message);
                    }
                }

            } else {
                console.log("Property", this.modelName, name, swaggerProperty, metadata[name]);
                process.exit(1);
            }
        }
    }

    private addPropertyError(name: string, message: string) {
        this.addError(`${name} : ${message}`);
    }

    private validateEnum() {
        const values: string[] = (Object as any).values(this.model);
        const swaggerValues = this.definition.enum;
        for (const value of swaggerValues) {
            if (!values.includes(value)) {
                this.addError(`Enum is missing value ${value}. Only has ${values}`);
            }
        }
    }
}

class SwaggerSpecs {
    constructor(private specs) { }

    public getDefinition(name: string): SwaggerDefinition {
        return this.specs.definitions[name];
    }
}

function getModel(name: string) {
    if (name in models) {
        return models[name];
    } else if (name in swaggerMappings) {
        return models[swaggerMappings[name]];
    } else {
        throw new Error(`Unknown model ${name}. Need to add an mapping?`);
    }
}

async function run() {
    console.log("Validating models...");
    const { mappings, specs } = await getMapping();

    let errors = [];
    for (const mapping of mappings) {
        const validator = new SwaggerModelValidator(specs, mapping.name, mapping.model, mapping.definition);
        validator.validate();
        errors = errors.concat(validator.errors);
    }

    if (errors.length > 0) {
        console.warn(`\nValidation completed with ${errors.length} errors`);
        process.exit(2);
    } else {
        console.log("All models are valid.");
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
