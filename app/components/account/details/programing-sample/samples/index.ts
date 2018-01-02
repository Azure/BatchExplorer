// tslint:disable:no-var-requires

const python = require("raw-loader!./python.py");
const csharp = require("raw-loader!./csharp.cs");
const nodejs = require("raw-loader!./node.js");

export const sampleTemplates = {
    python,
    csharp,
    nodejs,
};

export const samplesLink = {
    python: "https://github.com/Azure/azure-batch-samples/tree/master/Python",
    csharp: "https://github.com/Azure/azure-batch-samples/tree/master/CSharp",
    nodejs: "https://github.com/Azure/azure-batch-samples/tree/master/Node.js",
};

export const prerequisites = {
    python: [
        `pip install azure-batch`,
    ],
    csharp: [
        `dotnet add package Azure.Batch`,
    ],
    nodejs: [
        `npm install azure-batch`,
    ],
};
