import { BehaviorSubject } from "rxjs";

fdescribe("ElectronUtils", () => {
    describe("warpMainObservable", () => {
        let subject: BehaviorSubject<number>;

        beforeEach(() => {
            subject = new BehaviorSubject(0);
        });

        afterEach(() => {
            subject.complete();
        });

        it("does stuff", () => {

        });
    });
});
