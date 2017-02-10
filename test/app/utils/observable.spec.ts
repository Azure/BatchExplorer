import { fakeAsync, tick } from "@angular/core/testing";
import { AsyncSubject, Observable } from "rxjs";

import { ObservableUtils } from "app/utils";

describe("ObservableUtils", () => {
    describe("#cascade()", () => {
        it("queue observable should call them one by one", fakeAsync(() => {
            const obs1 = new AsyncSubject();
            const obs1Func = jasmine.createSpy("obs1").and.returnValue(obs1);
            const obs2 = new AsyncSubject();
            const obs2Func = jasmine.createSpy("obs2").and.returnValue(obs2);
            const obs3 = new AsyncSubject();
            const obs3Func = jasmine.createSpy("obs3").and.returnValue(obs3);
            let out: any;
            ObservableUtils.queue(obs1Func, obs2Func, obs3Func).subscribe((x) => out = x);

            expect(obs1Func).toHaveBeenCalledOnce();
            expect(obs2Func).not.toHaveBeenCalled();
            expect(obs3Func).not.toHaveBeenCalled();

            obs1.next("val1");
            obs1.complete();
            tick();

            expect(obs1Func).toHaveBeenCalledOnce();
            expect(obs2Func).toHaveBeenCalledOnce();
            expect(obs3Func).not.toHaveBeenCalled();

            obs2.next("val2");
            obs2.complete();
            tick();

            expect(obs1Func).toHaveBeenCalledOnce();
            expect(obs2Func).toHaveBeenCalledOnce();
            expect(obs3Func).toHaveBeenCalledOnce();

            obs3.next("val3");
            obs3.complete();
            tick();

            expect(obs1Func).toHaveBeenCalledOnce();
            expect(obs2Func).toHaveBeenCalledOnce();
            expect(obs3Func).toHaveBeenCalledOnce();

            expect(out).toEqual(["val1", "val2", "val3"]);
        }));

        it("should return value if not returned an observable", () => {
            const obs1 = Observable.of(1).cascade((val) => {
                return null;
            });
            const obs2 = Observable.of(1).cascade((val) => {
                return val + 2;
            });
            let obs1Val;
            let obs2Val;
            obs1.subscribe(x => obs1Val = x);
            obs2.subscribe(x => obs2Val = x);

            expect(obs1Val).toBe(null);
            expect(obs2Val).toBe(3);
        });
    });
});
