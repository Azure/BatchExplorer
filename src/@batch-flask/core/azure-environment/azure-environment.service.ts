import { Injectable } from "@angular/core";
import { FileSystemService, MainGlobalStorage } from "@batch-flask/electron";
import { clientFileUrl } from "client/client-constants";
import { Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";
import { AzureEnvironment, SupportedEnvironments } from "./azure-environment";

@Injectable()
export class AzureEnvironmentService {
    public static readonly KEY = "azure-environments";
    public envs: Observable<AzureEnvironment[]>;

    constructor(private storage: MainGlobalStorage, private fs: FileSystemService) {
        this.envs = storage.watch<AzureEnvironment[]>(AzureEnvironmentService.KEY).pipe(
            map((content) => {
                console.log("content", content);
                return [
                    ...Object.values(SupportedEnvironments),
                    ...content || [],
                ];
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public async editCustomEnvironments() {
        const filePaths = clientFileUrl("resources/default-env.json", false);
        const content = await this.fs.readFile(process.env.HOT ? filePaths.dev : filePaths.prod);
        await this.storage.setDefault(AzureEnvironmentService.KEY, content);

        this.storage.openFile(AzureEnvironmentService.KEY);
    }
}
