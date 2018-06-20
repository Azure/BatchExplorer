import { Dto, DtoAttr } from "@batch-flask/core";

export class MetaDataDto extends Dto<MetaDataDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public value: string;
}

export class EnvironmentSetting extends Dto<MetaDataDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public value: string;
}
