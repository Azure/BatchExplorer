import { Dto, DtoAttr } from "@batch-flask/core";

export class EnvironmentSettingDto extends Dto<EnvironmentSettingDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public value: string;
}
