import { File } from "app/models";
import { TreeComponentItem } from "app/models/tree-component-item";
import { TreeComponentUtils } from "app/utils";
import { FileProperties } from "azure-batch/lib/models";

const testCases = [
    {
        fileList: [],
        output: null,
    },
    {
        fileList: <File[]>[
            {
                name: "startup\ProcessEnv1.cmd",
                properties: <FileProperties>{
                    contentLength: 2132,
                },
            },
            {
                name: "startup\ProcessEnv2.cmd",
                properties: <FileProperties>{
                    contentLength: 0,
                },
            },
            {
                name: "startup\ProcessEnv3.cmd",
                properties: <FileProperties>{
                    contentLength: 0,
                },
            },
            {
                name: "startup\ProcessEnv4.cmd",
                properties: <FileProperties>{
                    contentLength: 0,
                },
            },
        ],
        output: null,
    },
    // {
    //     fileList: <File[]>[
    //         {
    //             name: "ProcessEnv1.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 2132,
    //             },
    //         },
    //         {
    //             name: "ProcessEnv2.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 0,
    //             },
    //         },
    //         {
    //             name: "ProcessEnv3.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 0,
    //             },
    //         },
    //         {
    //             name: "ProcessEnv4.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 0,
    //             },
    //         },
    //     ],
    //     output: null,
    // },
    // {
    //     fileList: <File[]>[
    //         {
    //             name: "a\b\c\d.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 2132,
    //             },
    //         },
    //         {
    //             name: "a1.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 4444,
    //             },
    //         },
    //         {
    //             name: "a2.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 1234,
    //             },
    //         },
    //         {
    //             name: "a3.cmd",
    //             properties: <FileProperties>{
    //                 contentLength: 1234,
    //             },
    //         },
    //     ],
    //     output: null,
    // },
];

fdescribe("TreeComponentUtils", () => {
    let treeNodes: TreeComponentItem[];
    beforeEach(() => {
        treeNodes = [];
    });

    describe("unflattenFileDirectory test", () => {
        testCases.map((test) => {
            it("should have correct unflatten objects", () => {
                //let output = TreeComponentUtils.unflattenFileDirectory(treeNodes, test.fileList);
                //console.log(output);
            });
        });
    });
});
