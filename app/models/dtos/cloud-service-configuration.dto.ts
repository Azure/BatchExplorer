import { Dto, DtoAttr } from "@batch-flask/core";

export class CloudServiceConfiguration extends Dto<CloudServiceConfiguration> {
    @DtoAttr()
    public osFamily: string;

    @DtoAttr()
    public targetOSVersion?: string;
}
