import { Dto, DtoAttr } from "@batch-flask/core";

export class CloudServiceConfigurationDto extends Dto<CloudServiceConfigurationDto> {
    @DtoAttr()
    public osFamily: string;

    @DtoAttr()
    public osVersion?: string;
}
