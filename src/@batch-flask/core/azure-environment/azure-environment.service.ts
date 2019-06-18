import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalStorage } from "../data-store";
import { AzureEnvironment } from "./azure-environment";

@Injectable()
export class AzureEnvironmentService {
    public envs: Observable<AzureEnvironment[]>;

    constructor(storage: GlobalStorage) {
        storage.watch("azure-environments").subscribe((content) => {
            console.log("Content of file", content);
        });
    }
}
