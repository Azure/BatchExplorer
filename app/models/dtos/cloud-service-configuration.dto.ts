import { Dto, DtoAttr } from "app/core";

export class CloudServiceConfiguration extends Dto<CloudServiceConfiguration> {
    @DtoAttr()
    public osFamily: string;

    @DtoAttr()
    public targetOSVersion?: string;
}
