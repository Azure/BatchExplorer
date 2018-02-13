import { Dto, DtoAttr } from "app/core";

export class AccountCreateDto extends Dto<AccountCreateDto> {
    @DtoAttr() public location: string;
}
