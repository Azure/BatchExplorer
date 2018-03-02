import { Dto, DtoAttr } from "@bl-common/core";

export class CloudServiceConfiguration extends Dto<CloudServiceConfiguration> {
    @DtoAttr()
    public osFamily: string;

    @DtoAttr()
    public targetOSVersion?: string;
}
