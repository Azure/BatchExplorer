import { Dto, DtoAttr } from "@batch-flask/core/dto";
import { AccountPatchDto } from "./account-patch.dto";

export class AccountCreateDto extends Dto<AccountCreateDto> {
    @DtoAttr() public location: string;

    @DtoAttr() public properties: AccountPatchDto;
}
