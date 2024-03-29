import { ObjectUtils, log } from "@batch-flask/utils";
import { NcjParameter } from "app/models";
import * as inflection from "inflection";

export enum NcjParameterExtendedType {
    string = "string",
    int = "int",
    fileGroup = "file-group",
    fileInFileGroup = "file-in-file-group",
    fileGroupSas = "file-group-sas",
    fileGroupWriteSas = "file-group-write-sas",
    dropDown = "drop-down",
    jobId = "job-id",
    renderingContainerImage= "rendering-container-image",
    containerImageOnPool= "container-image-on-pool",
}

export class NcjParameterWrapper {
    public type: NcjParameterExtendedType;
    public dependsOn: string;
    public name: string;
    public description: string;
    public defaultValue: any;
    public allowedValues: string[];
    public wildcards: string;
    public additionalProperties: StringMap<string>;

    constructor(public id: string, public param: NcjParameter) {
        this._computeName();
        this._computeDefaultValue();
        this._computeDescription();
        this._computeType();
        this._computeAdditionalProperties();
    }

    private _computeName() {
        this.name = inflection.humanize(inflection.underscore(this.id));
    }

    private _computeDefaultValue() {
        let defaultValue = this.param.defaultValue;
        if (typeof defaultValue === "string" &&
            defaultValue.toLowerCase().trim() === "none") {
            defaultValue = "";
        }
        this.defaultValue = this.param.defaultValue = defaultValue;
    }

    private _computeDescription() {
        if (this.param.metadata && this.param.metadata.description) {
            this.description = this.param.metadata.description;
        }
    }

    private _computeDependsOn() {
        if (this.param.metadata && this.param.metadata.dependsOn) {
            this.dependsOn = this.param.metadata.dependsOn;
        }
    }

    private _computeAllowedValues() {
        const param = this.param;
        if (param.allowedValues) {
            this.allowedValues = param.allowedValues;
        } else {
            this.allowedValues = [];
        }
    }

    private _computeWildcardFilter() {
        if (this.param.metadata && this.param.metadata.wildcards) {
            this.wildcards = this.param.metadata.wildcards;
        }
    }

    private _computeAdditionalProperties() {
        if (this.param.additionalProperties) {
            this.additionalProperties = this.param.additionalProperties;
        }
    }

    private _computeType() {
        this._computeDependsOn();
        this._computeAllowedValues();
        this._computeWildcardFilter();

        const param = this.param;
        if (param.allowedValues) {
            this.type = NcjParameterExtendedType.dropDown;
            return;
        } else if (param.metadata && param.metadata.advancedType) {
            const type = param.metadata.advancedType;
            if (!ObjectUtils.values(NcjParameterExtendedType as any).includes(type)) {
                log.error(`Advanced typed '${type}' is unknown!`, NcjParameterExtendedType);
            }

            this.type = type as NcjParameterExtendedType;
            return;
        }

        this.type = param.type as any;
    }
}
