import { DependencyName, inject } from "@batch/ui-common/lib/environment";
import { HttpClient } from "@batch/ui-common/lib/http";

export interface HttpService {
    httpClient: HttpClient;
}

export abstract class AbstractHttpService {
    httpClient: HttpClient = inject(DependencyName.HttpClient);
}
