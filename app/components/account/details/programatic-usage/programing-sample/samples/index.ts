// tslint:disable:no-var-requires
export const sampleTemplates = {
    sharedKey: {
        python: require("raw-loader!./shared-key/python.py.template"),
        csharp: require("raw-loader!./shared-key/csharp.cs.template"),
        nodejs: require("raw-loader!./shared-key/node.js.template"),
    },
    aad: {
        python: require("raw-loader!./aad/python.py.template"),
        csharp: require("raw-loader!./aad/csharp.cs.template"),
        nodejs: require("raw-loader!./aad/node.js.template"),
    },
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
