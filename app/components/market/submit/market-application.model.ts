import { NcjParameter } from "app/models";
import { ObjectUtils, log } from "app/utils";
import * as inflection from "inflection";

export enum Modes {
    None,
    NewPoolAndJob,
    OldPoolAndJob,
    NewPool,
}

export enum NcjParameterExtendedType {
    string = "string",
    int = "int",
    fileGroup = "file-group",
    fileInFileGroup = "file-in-file-group",
    dropDown = "drop-down",
}

export class NcjParameterWrapper {
    public type: NcjParameterExtendedType;
    public dependsOn: string;
    public name: string;
    public description: string;
    public defaultValue: any;
    public allowedValues: string[];

    constructor(public id: string, private _param: NcjParameter) {
        this._computeName();
        this._computeDefaultValue();
        this._computeDescription();
        this._computeType();
    }

    private _computeName() {
        this.name = inflection.humanize(inflection.underscore(this.id));
    }

    private _computeDefaultValue() {
        if (this._param.defaultValue) {
            this.defaultValue = this._param.defaultValue;
        }
    }

    private _computeDescription() {
        if (this._param.metadata && this._param.metadata.description) {
            this.description = this._param.metadata.description;
        }
    }

    private _computeDependsOn() {
        if (this._param.metadata && this._param.metadata.dependsOn) {
            this.dependsOn = this._param.metadata.dependsOn;
        }
    }

    private _computeAllowedValues() {
        const param = this._param;
        if (param.allowedValues) {
            this.allowedValues = param.allowedValues;
        } else {
            this.allowedValues = [];
        }
    }

    private _computeType() {
        this._computeDependsOn();
        this._computeAllowedValues();
        const param = this._param;
        if (param.allowedValues) {
            this.type = NcjParameterExtendedType.dropDown;
            return;
        } else if (param.metadata && param.metadata.advancedType) {
            const type = param.metadata.advancedType;
            if (!ObjectUtils.values(NcjParameterExtendedType as any).includes(type)) {
                log.error(`Advanced typed '${type}' is unkown!`, NcjParameterExtendedType);
            }
            this.type = type as NcjParameterExtendedType;
            return;
        }
        this.type = param.type as any;
    }
}
