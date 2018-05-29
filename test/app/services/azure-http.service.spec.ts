import { Injector, ReflectiveInjector } from "@angular/core";
import { fakeAsync, tick } from "@angular/core/testing";
import { BaseRequestOptions, ConnectionBackend, Http, RequestOptions, Response, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Observable } from "rxjs";

import { HttpCode, ServerError } from "@batch-flask/core";
import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { AdalService, AzureHttpService, BatchLabsService } from "app/services";

describe("AzureHttpService", () => {
    let service: AzureHttpService;
    let adalSpy: any;
    let injector: Injector;
    let backend: MockBackend;
    let lastResponse: Response = null;
    let lastError: ServerError = null;
    let appServiceSpy;

    function subscribeResponse(obs: Observable<Response>) {
        obs.subscribe({
            next: (x) => lastResponse = x,
            error: (x) => lastError = x,
        });
    }

    beforeEach(() => {

        adalSpy = {
            accessTokenData: () => Observable.of({ accessToken: "abc" }),
        };

        appServiceSpy = {
            azureEnvironment: AzureEnvironment.Azure,
        };

        injector = ReflectiveInjector.resolveAndCreate([
            { provide: ConnectionBackend, useClass: MockBackend },
            { provide: RequestOptions, useClass: BaseRequestOptions },
            { provide: AdalService, useValue: adalSpy },
            { provide: BatchLabsService, useValue: appServiceSpy },
            Http,
            AzureHttpService,
        ]);

        service = injector.get(AzureHttpService);
        backend = injector.get(ConnectionBackend) as MockBackend;
    });

    it("when returning retyable errors it should retry until max retry", fakeAsync(() => {
        backend.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Response(new ResponseOptions({
                status: HttpCode.GatewayTimeout,
                body: JSON.stringify({}),
            })) as any);
        });
        const output = service.get("tenant-1", "some-uri");
        subscribeResponse(output);

        // Exponential backoff
        tick(300);
        expect(lastError).toBeNull();
        tick(900);
        expect(lastError).toBeNull();
        tick(2700);
        expect(lastError).toBeNull();
        tick(8100);
        expect(lastError).toBeNull();
        tick(24300);
        expect(lastError.status).toBe(HttpCode.GatewayTimeout);
    }));
});
