import { ApplicationDefaultComponent } from "app/components/application/details";

describe("ApplicationDefaultComponent", () => {
    it("has correct breadcrumb name", () => {
        expect(ApplicationDefaultComponent.breadcrumb().name).toEqual("Applications");
    });
});
