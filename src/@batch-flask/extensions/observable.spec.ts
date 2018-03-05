import { Observable } from "rxjs";

import "./observable";

describe("Observable extensions", () => {
    it("Should cascade observable", (done) => {
        Observable.of(1).cascade((out) => {
            expect(out).toBe(1);
            return Observable.of(1 + out);
        }).subscribe((result) => {
            expect(result).toBe(2);
            done();
        });
    });
});
