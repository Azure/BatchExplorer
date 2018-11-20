import { NcjParameterRawType } from "app/models";
import { NcjParameterExtendedType, NcjParameterWrapper } from "./market-application.model";

describe("marketApplicationModel", () => {
    let parameter: NcjParameterWrapper;

    it("should detect text type", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
            defaultValue: "jobname",
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.string);
    });

    it("should compute friendly name", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
            defaultValue: "jobname",
        });
        expect(parameter.name).toBe("Job name");
    });

    it("should have default", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
            defaultValue: "jobname",
        });
        expect(parameter.defaultValue).toBe("jobname");
    });

    it("should not have default", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
        });
        expect(parameter.defaultValue).toBeUndefined();
    });

    it("should have allowedValues", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
            allowedValues : ["a", "b", "c", "d"],
        });
        expect(parameter.allowedValues.length).toBe(4);
    });

    it("should not have allowedValues", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "Param Description",
            },
        });
        expect(parameter.allowedValues.length).toBe(0);
    });

    it("should have description", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
            },
        });
        expect(parameter.description).toBe("description");
    });

    it("should have dependsOn", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                dependsOn: "dependson",
            },
        });
        expect(parameter.dependsOn).toBe("dependson");
    });

    it("should not have dependsOn", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
            },
        });
        expect(parameter.dependsOn).toBeUndefined();
    });

    it("should detect int type", () => {
        parameter = new NcjParameterWrapper("frameEnd", {
            type: NcjParameterRawType.int,
            metadata : {
                description: "description",
            },
            defaultValue: 4,
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.int);
    });

    it("should detect int defaultValue", () => {
        parameter = new NcjParameterWrapper("frameEnd", {
            type: NcjParameterRawType.int,
            metadata : {
                description: "description",
            },
            defaultValue: 4,
        });
        expect(parameter.defaultValue).toBe(4);
    });

    it("should detect dropdown type", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
            },
            allowedValues : ["a", "b", "c"],
            defaultValue: "jobname",
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.dropDown);
    });

    it("should detect dropdown defaultValue", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
            },
            allowedValues : ["a", "b", "c"],
            defaultValue: "c",
        });
        expect(parameter.defaultValue).toBe("c");
    });

    it("should detect filegroup type", () => {
        parameter = new NcjParameterWrapper("outputFileGroup", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileGroup,
            },
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.fileGroup);
    });

    it("should detect filegroup defaultValue", () => {
        parameter = new NcjParameterWrapper("outputFileGroup", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileGroup,
            },
            defaultValue: "filegroup",
        });
        expect(parameter.defaultValue).toBe("filegroup");
    });

    it("should detect fileinput type", () => {
        parameter = new NcjParameterWrapper("blendFile", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileInFileGroup,
                dependsOn: "sceneData",
            },
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.fileInFileGroup);
    });

    it("should detect fileinput defaultValue", () => {
        parameter = new NcjParameterWrapper("blendFile", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileInFileGroup,
                dependsOn: "sceneData",
            },
            defaultValue: "fileinput",
        });
        expect(parameter.defaultValue).toBe("fileinput");
    });

    it("should detect filegroup sas type", () => {
        parameter = new NcjParameterWrapper("fileGroupSas", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileGroupSas,
                dependsOn: "fileGroup",
            },
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.fileGroupSas);
    });

    it("should detect filegroup writable sas type", () => {
        parameter = new NcjParameterWrapper("fileGroupWritableSas", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.fileGroupWriteSas,
            },
        });
        expect(parameter.type).toBe(NcjParameterExtendedType.fileGroupWriteSas);
    });

    it("should detect job-ids type", () => {
        parameter = new NcjParameterWrapper("jobName", {
            type: NcjParameterRawType.string,
            metadata : {
                description: "description",
                advancedType: NcjParameterExtendedType.jobId,
            },
        });

        expect(parameter.type).toBe(NcjParameterExtendedType.jobId);
    });
});
