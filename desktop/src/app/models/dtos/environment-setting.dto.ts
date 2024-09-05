import { Dto, DtoAttr } from "@batch-flask/core/dto";

export class EnvironmentSettingDto extends Dto<EnvironmentSettingDto> {
    @DtoAttr() public name: string;
    @DtoAttr() public value: string;
}
