import { DependencyName, inject } from "@batch/ui-common/lib/environment";
import { HttpClient, HttpResponse } from "@batch/ui-common/lib/http";

export interface HttpService {
    httpClient: HttpClient;
}

export abstract class AbstractHttpService implements HttpService {
    httpClient: HttpClient = inject(DependencyName.HttpClient);
}

/**
 * The result of getting a single model from an HTTP request
 */
export class HttpResult<T> {
    response: HttpResponse;
    model?: T;

    constructor(response: HttpResponse, model?: T) {
        this.model = model;
        this.response = response;
    }
}

/**
 * The result of getting a list of models from an HTTP request
 * TODO: Add support for skip tokens
 */
export class HttpListResult<T> {
    response: HttpResponse;
    models: T[];

    constructor(response: HttpResponse, models: T[] = []) {
        this.models = models;
        this.response = response;
    }
}
