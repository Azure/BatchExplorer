import { Injectable } from "@angular/core";
import { FileSystemService, MainGlobalStorage } from "@batch-flask/electron";
import { log } from "@batch-flask/utils";
import { clientFileUrl } from "client/client-constants";
import { Observable } from "rxjs";
import { map, publishReplay, refCount, take } from "rxjs/operators";
import { AzureEnvironment, SupportedEnvironments } from "./azure-environment";

@Injectable()
export class AzureEnvironmentService {
    public static readonly KEY = "azure-environments";
    public envs: Observable<AzureEnvironment[]>;

    constructor(private storage: MainGlobalStorage, private fs: FileSystemService) {
        this.envs = storage.watch(AzureEnvironmentService.KEY).pipe(
            map((content) => {
                return [
                    ...Object.values(SupportedEnvironments),
                    ...this._proccessCustomEnvironments(content),
                ];
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public async get(id: string): Promise<AzureEnvironment | undefined> {
        const envs = await this.envs.pipe(take(1)).toPromise();
        return envs.find(x => x.id === id);
    }

    public async editCustomEnvironments() {
        const filePaths = clientFileUrl("resources/default-env.json", false);
        const content = await this.fs.readFile(process.env.HOT ? filePaths.dev : filePaths.prod);
        await this.storage.setDefault(AzureEnvironmentService.KEY, content);

        this.storage.openFile(AzureEnvironmentService.KEY);
    }

    private _proccessCustomEnvironments(value: unknown): AzureEnvironment[] {
        if (!value || !Array.isArray(value)) { return []; }

        const requiredProperties = [
            "id",
            "name",
            "aadUrl",
            "arm",
            "batch",
            "msGraph",
            "aadGraph",
            "appInsights",
            "storageEndpoint",
        ];

        return value.filter((env) => {
            for (const prop of requiredProperties) {
                if (!(prop in env)) {
                    log.error(
                        `Custom environment is in a wrong format: Missing property ${prop} in ${JSON.stringify(env)}`);
                    return false;
                }
            }
            return true;
        }).map(x => {
            return { ...x, custom: true };
        });
    }
}
