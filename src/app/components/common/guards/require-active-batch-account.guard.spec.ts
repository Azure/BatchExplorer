import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { DialogService } from "@batch-flask/ui";
import { BatchAccountService } from "app/services";
import { BehaviorSubject, Subject } from "rxjs";
import { RequireActiveBatchAccountGuard } from "./require-active-batch-account.guard";
import { SelectAccountDialogComponent } from "./select-acccount-dialog";

describe("RequireActiveBatchAccountGuard", () => {
    let guard: RequireActiveBatchAccountGuard;
    let accountServiceSpy;
    let dialogServiceSpy;
    let router: Router;
    let beforeClosed: Subject<string | null>;

    beforeEach(() => {
        beforeClosed = new Subject();
        accountServiceSpy = {
            currentAccountId: new BehaviorSubject(null),
        };

        const fakeDialogRef = {
            beforeClosed: () => beforeClosed,
        };

        dialogServiceSpy = {
            open: jasmine.createSpy("dialog.open").and.returnValue(fakeDialogRef),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                RequireActiveBatchAccountGuard,
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
            ],
        });

        guard = TestBed.inject(RequireActiveBatchAccountGuard);
        router = TestBed.inject(Router);
    });

    it("resolve to true if account id is already picked", async () => {
        accountServiceSpy.currentAccountId.next("/accounts/acc-1");
        const result = await guard.canActivate().toPromise();
        expect(result).toBe(true);
        expect(dialogServiceSpy.open).not.toHaveBeenCalled();
    });

    it("prompt the user with an account selection dialog if no account selected", () => {
        const callback = jasmine.createSpy("canActivate");
        guard.canActivate().subscribe(callback);
        expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
        expect(dialogServiceSpy.open).toHaveBeenCalledWith(SelectAccountDialogComponent);

        expect(callback).not.toHaveBeenCalled();

        beforeClosed.next("/accounts/acc-2");
        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith(true);
    });

    it("redirect to the account page if user click out of the dialog", () => {
        const callback = jasmine.createSpy("canActivate");
        guard.canActivate().subscribe(callback);
        expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
        expect(dialogServiceSpy.open).toHaveBeenCalledWith(SelectAccountDialogComponent);

        expect(callback).not.toHaveBeenCalled();

        beforeClosed.next(null);
        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith(router.createUrlTree(["/accounts"]));
    });
});
