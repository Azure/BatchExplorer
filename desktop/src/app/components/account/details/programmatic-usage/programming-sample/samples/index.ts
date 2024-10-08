/* eslint-disable @typescript-eslint/no-var-requires */
export const sampleTemplates = {
    sharedKey: {
        python: require("./shared-key/python.py.template"),
        csharp: require("./shared-key/csharp.cs.template"),
        nodejs: require("./shared-key/node.js.template"),
        doAzureParallel: require("./shared-key/doAzureParallel.json.template"),
    },
    aad: {
        python: require("./aad/python.py.template"),
        csharp: require("./aad/csharp.cs.template"),
        nodejs: require("./aad/node.js.template"),
        aztk: require("./aad/aztk.yaml.template"),
        doAzureParallel: require("./aad/doAzureParallel.json.template"),
    },
};

export const samplesLink = {
    python: "https://github.com/Azure/azure-batch-samples/tree/master/Python",
    csharp: "https://github.com/Azure/azure-batch-samples/tree/master/CSharp",
    nodejs: "https://github.com/Azure/azure-batch-samples/tree/master/Node.js",
    aztk: "https://github.com/Azure/aztk",
    doAzureParallel: "https://github.com/Azure/doAzureParallel",
};

export const prerequisites = {
    sharedKey: {
        python: [
            `pip install azure-batch`,
        ],
        csharp: [
            `dotnet add package Azure.Batch`,
        ],
        nodejs: [
            `npm install azure-batch`,
        ],
    },
    aad: {
        python: [
            `pip install azure-batch`,
            `pip install msrestazure`,
        ],
        csharp: [
            `dotnet add package Azure.Batch`,
            `dotnet add package Microsoft.IdentityModel.Clients.ActiveDirectory`,
        ],
        nodejs: [
            `npm install azure-batch`,
            `npm install ms-rest`,
            `npm install ms-rest-azure`,
        ],
        aztk: [
            `pip install aztk`,
            `aztk spark init`,
        ],
    },
};
