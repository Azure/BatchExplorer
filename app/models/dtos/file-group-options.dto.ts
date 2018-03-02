import { Dto, DtoAttr } from "@bl-common/core";

export class FileGroupOptionsDto extends Dto<FileGroupOptionsDto> {
    @DtoAttr()
    public prefix: string;

    @DtoAttr()
    public flatten: boolean;

    @DtoAttr()
    public fullPath: boolean;
}
