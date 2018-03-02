import { Dto, DtoAttr } from "@bl-common/core";

export class AutoStoragePatchDto extends Dto<AutoStoragePatchDto> {
    @DtoAttr()
    public storageAccountId: string;
}

export class AccountPatchDto extends Dto<AccountPatchDto> {
    @DtoAttr()
    public autoStorage: AutoStoragePatchDto;
}
