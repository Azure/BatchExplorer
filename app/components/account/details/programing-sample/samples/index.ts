// tslint:disable:no-var-requires

const python = require("raw-loader!./python.py");
const csharp = require("raw-loader!./csharp.cs");

export const sampleTemplates = {
    python,
    csharp,
};

export const samplesLink = {
    python: "https://github.com/Azure/azure-batch-samples/tree/master/Python",
    csharp: "https://github.com/Azure/azure-batch-samples/tree/master/CSharp",
};

export const prerequisites = {
    python: [
        `pip install azure-batch`,
    ],
    csharp: [
        `dotnet add package Azure.Batch`,
    ],
};
