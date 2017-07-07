import { Dto, DtoAttr } from "app/core";
import { FileGroupOptionsDto } from "./file-group-options.dto";

export class FileGroupCreateDto extends Dto<FileGroupCreateDto> {
    @DtoAttr()
    public name: string;

    @DtoAttr()
    public folder: string;

    @DtoAttr()
    public accessPolicy: string;

    @DtoAttr()
    public options?: FileGroupOptionsDto;
}
