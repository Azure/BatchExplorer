import { Dto, DtoAttr } from "@batch-flask/core";
import { FileGroupOptionsDto } from "./file-group-options.dto";

export class FileOrDirectoryDto extends Dto<FileOrDirectoryDto> {
    @DtoAttr()
    public path: string;
}

export class FileGroupCreateDto extends Dto<FileGroupCreateDto> {
    @DtoAttr()
    public name: string;

    @DtoAttr()
    public paths: FileOrDirectoryDto[];

    @DtoAttr()
    public includeSubDirectories: boolean;

    @DtoAttr()
    public accessPolicy?: string;

    @DtoAttr()
    public options?: FileGroupOptionsDto;
}
