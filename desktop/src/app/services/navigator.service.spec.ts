import { ElectronTestingModule } from '@batch-flask/electron/testing';
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { IpcService } from "@batch-flask/electron";
import { BatchAccountService } from "./batch-account";
import { AuthService } from "app/services";
import { NavigatorService } from "./navigator.service";
import { Constants, BatchExplorerLink, BatchExplorerLinkAction } from "common";
import { IpcEvent } from "common/constants";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from 'rxjs';

describe("NavigatorService", () => {
    let service: NavigatorService;
    let accountService: jasmine.SpyObj<BatchAccountService>;
    let router: jasmine.SpyObj<Router>;
    let ipc: jasmine.SpyObj<IpcService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        const accountServiceSpy = jasmine.createSpyObj("BatchAccountService", ["selectAccount"]);
        const authServiceSpy = jasmine.createSpyObj("AuthService", ["showAuthSelect"]);
        const ipcSpy = jasmine.createSpyObj("IpcService", ["on"]);
        const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
        ipcSpy.on.and.returnValue(of([null, null]));

        TestBed.configureTestingModule({
            imports: [ElectronTestingModule, RouterTestingModule],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: IpcService, useValue: ipcSpy },
                { provide: Router, useValue: routerSpy },
            ]
        });

        accountService = TestBed.inject(BatchAccountService) as jasmine.SpyObj<BatchAccountService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        ipc = TestBed.inject(IpcService) as jasmine.SpyObj<IpcService>;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

        service = new NavigatorService(accountService, router, ipc, authService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should unsubscribe from _destroy on ngOnDestroy", () => {
        const destroySpy = spyOn(service["_destroy"], "next");
        const unsubscribeSpy = spyOn(service["_destroy"], "unsubscribe");

        service.ngOnDestroy();

        expect(destroySpy).toHaveBeenCalled();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should initialize and subscribe to IPC events", () => {
        service.init();

        expect(ipc.on).toHaveBeenCalledWith(Constants.rendererEvents.batchExplorerLink);
        expect(ipc.on).toHaveBeenCalledWith(Constants.rendererEvents.navigateTo);
        expect(ipc.on).toHaveBeenCalledWith(IpcEvent.userAuthSelectRequest);
    });

    it("should handle openBatchExplorerLink with route action", () => {
        const params = new URLSearchParams("param1=value1&param2=value2");
        const link = new BatchExplorerLink({
            action: BatchExplorerLinkAction.route,
            path: "/some/path",
            queryParams: params,
            session: null,
            accountId: "account-id"
        });

        spyOn(service, "goto");

        service.openBatchExplorerLink(link);

        expect(service.goto).toHaveBeenCalledWith("/some/path?param1=value1&param2=value2", { accountId: "account-id" });
    });

    it("should navigate to a route with goto method", async () => {
        const route = "/some/path";
        const options = { accountId: "account-id" };

        accountService.selectAccount.and.returnValue(undefined);
        router.navigateByUrl.and.returnValue(Promise.resolve(true));

        const result = await service.goto(route, options);

        expect(accountService.selectAccount).toHaveBeenCalledWith("account-id");
        expect(router.navigateByUrl).toHaveBeenCalledWith(route);
        expect(result).toBe(true);
    });
});
