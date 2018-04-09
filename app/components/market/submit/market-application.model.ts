import { NcjParameter } from "app/models";
import { ObjectUtils, log } from "app/utils";
import * as inflection from "inflection";

export enum NcjParameterExtendedType {
    string = "string",
    int = "int",
    fileGroup = "file-group",
    fileInFileGroup = "file-in-file-group",
    fileGroupSas = "file-group-sas",
    dropDown = "drop-down",
}

export class NcjParameterWrapper {
    public type: NcjParameterExtendedType;
    public dependsOn: string;
    public name: string;
    public description: string;
    public defaultValue: any;
    public allowedValues: string[];
    public suffixFilter: string;

    constructor(public id: string, public param: NcjParameter) {
        this._computeName();
        this._computeDefaultValue();
        this._computeDescription();
        this._computeType();
    }

    private _computeName() {
        this.name = inflection.humanize(inflection.underscore(this.id));
    }

    private _computeDefaultValue() {
        if (this.param.defaultValue) {
            this.defaultValue = this.param.defaultValue;
        }
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

    private _computeSuffixFilter() {
        if (this.param.metadata && this.param.metadata.suffixFilter) {
            this.suffixFilter = this.param.metadata.suffixFilter;
        }
    }

    private _computeType() {
        this._computeDependsOn();
        this._computeAllowedValues();
        this._computeSuffixFilter();
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
