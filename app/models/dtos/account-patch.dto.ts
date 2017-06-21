import { Dto, DtoAttr } from "app/core";

export class AutoStoragePatchDto extends Dto<AutoStoragePatchDto> {
    @DtoAttr()
    public storageAccountId: string;
}

export class AccountPatchDto extends Dto<AccountPatchDto> {
    @DtoAttr()
    public autoStorage: AutoStoragePatchDto;
}
