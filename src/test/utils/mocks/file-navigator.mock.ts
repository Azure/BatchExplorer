import { BasicListGetter, DataCache } from "@batch-flask/core";
import { File, FileLoader, FileNavigator } from "@batch-flask/ui";
import { Observable, of } from "rxjs";

export class MockFileNavigator extends FileNavigator {
    private _mockFiles: File[];
    constructor(mockFiles: File[]) {
        const cache = new DataCache<File>("name");

        super({
            cache,
            params: {},
            getter: new BasicListGetter<File, any>(File, {
                cache: () => cache,
                supplyData: (params, options) => {
                    return this._supplyFiles(params, options);
                },
            }),
            getFile: (filename) => new FileLoader({
                filename,
                fs: null,
                source: "custom-test",
                properties: () => of(new File({ name: filename })),
                content: () => of({ content: "some-content" }),
            }),
        });

        this._mockFiles = mockFiles;
    }

    private _supplyFiles(params, options): Observable<any> {
        return of({
            data: this._mockFiles,
        });
    }
}
