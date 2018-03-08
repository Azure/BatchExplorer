import { Dto, DtoAttr } from "@batch-flask/core";
import { FileGroupOptionsDto } from "./file-group-options.dto";

export class FileGroupCreateDto extends Dto<FileGroupCreateDto> {
    @DtoAttr()
    public name: string;

    @DtoAttr()
    public folder: string;

    @DtoAttr()
    public includeSubDirectories: boolean;

    @DtoAttr()
    public accessPolicy?: string;

    @DtoAttr()
    public options?: FileGroupOptionsDto;
}
