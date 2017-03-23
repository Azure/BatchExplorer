import { Type } from "@angular/core";

import { MetaDataDto } from "./metadata.dto";

type AttrOf<T> = {
    [P in keyof T]: T[P];
};

export class DtoBase<T> {
    constructor(data: AttrOf<T>) {
        const attrs = this._attrMetadata;
        console.log("Assign data", data);
        for (let key of Object.keys(attrs)) {
            const type = attrs[key];
            if (!(key in data)) {
                continue;
            }
            const value = (data as any)[key];
            console.log("Assign value for", key, value, type);
            if (type) {
                this[key] = new type(value);
            } else {
                this[key] = value;
            }
        }
        console.log("this", this);
    }

    public toJS(): AttrOf<T> {
        let output = {};
        const attrs = this._attrMetadata;
        for (let key of Object.keys(attrs)) {
            if (!(key in this)) {
                continue;
            }
            const value = this[key];
            if (value.toJS) {
                output[key] = value.toJS();
            } else {
                output = value;
            }
        }
        return output;
    }

    private get _metadata() {
        return (this.constructor as any)._metadata || {};
    }

    private get _attrMetadata() {
        return this._metadata.attrs || {};
    }
}

function DtoAttr(attrType: Type<any> = null) {
    return (cls, attr, other?) => {
        // console.log(cls, attr, other);
        const ctr = cls.constructor;
        if (!ctr._metadata) {
            ctr._metadata = {};
        }
        if (!ctr._metadata.attrs) {
            ctr._metadata.attrs = {};
        }
        ctr._metadata.attrs[attr] = attrType;
    };
}

export class CloudServiceConfiguration extends DtoBase<CloudServiceConfiguration> {
    @DtoAttr()
    public osFamily: string;

    @DtoAttr()
    public targetOSVersion?: string;
}

export class PoolCreateDto extends DtoBase<PoolCreateDto> {
    @DtoAttr()
    public id: string;

    @DtoAttr()
    public displayName?: string;

    @DtoAttr()
    public vmSize?: string;

    @DtoAttr(CloudServiceConfiguration)
    public cloudServiceConfiguration?: CloudServiceConfiguration;

    @DtoAttr()
    public virtualMachineConfiguration?: {
        nodeAgentSKUId: string;
        imageReference: {
            publisher: string;
            offer: string;
            sku: string;
            version?: string;
        }
        windowsConfiguration?: {
            enableAutomaticUpdates?: boolean;
        }
    };

    @DtoAttr()
    public networkConfiguration?: {
        subnetId: string;
    };

    @DtoAttr()
    public resizeTimeout?: moment.Duration;

    @DtoAttr()
    public targetDedicated?: number;

    @DtoAttr()
    public maxTasksPerNode?: number;

    @DtoAttr()
    public taskSchedulingPolicy?: {
        nodeFillType?: string;
    };

    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: moment.Duration;

    @DtoAttr()
    public enableAutoScale?: boolean;

    @DtoAttr()
    public enableInterNodeCommunication?: boolean;

    @DtoAttr()
    public startTask?: any;

    @DtoAttr()
    public certificateReferences?: any[];

    @DtoAttr()
    public applicationPackageReferences: any[];

    @DtoAttr()
    public metadata: MetaDataDto[];
}



export class VirtualMachineConfiguration extends DtoBase<VirtualMachineConfiguration> {

}
