import { Dto, DtoAttr } from "@batch-flask/core";

export class AccountCreateDto extends Dto<AccountCreateDto> {
    @DtoAttr() public location: string;

    @DtoAttr() public properties: any;
}
