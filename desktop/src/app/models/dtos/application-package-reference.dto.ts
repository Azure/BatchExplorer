import { Dto, DtoAttr } from "@batch-flask/core/dto";

export class AppPackageReferenceDto extends Dto<AppPackageReferenceDto> {
    @DtoAttr()
    public applicationId: string;

    @DtoAttr()
    public version: string;
}
