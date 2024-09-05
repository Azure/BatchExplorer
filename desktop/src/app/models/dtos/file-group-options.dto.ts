import { Dto, DtoAttr } from "@batch-flask/core/dto";

export class FileGroupOptionsDto extends Dto<FileGroupOptionsDto> {
    @DtoAttr()
    public prefix: string;

    @DtoAttr()
    public flatten: boolean;

    @DtoAttr()
    public fullPath: boolean;
}
