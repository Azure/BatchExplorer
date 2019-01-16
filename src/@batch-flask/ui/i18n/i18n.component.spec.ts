import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { I18nComponent, I18nParameterDirective } from "./i18n.component";

@Component({
    template: `<bl-i18n key="my-key.label"></bl-i18n>`,
})
class SimpleI18nComponent {
}

@Component({
    template: `
    <bl-i18n key="my-param.label">
        <span *i18nParam="'count'" class="count">4</span>
    </bl-i18n>`,
})
class ParameterI18nComponent {
}

const translations = {
    "my-key.label": "This is translated",
    "my-param.label": "There is {count} values",
    "my-namespace.foo.label": "Namespaced translation",
};

describe("I18nComponent", () => {
    let fixture: ComponentFixture<any>;
    let de: DebugElement;

    function setup(component, providers?) {
        TestBed.configureTestingModule({
            imports: [I18nTestingModule.withTranslations(translations)],
            declarations: [I18nParameterDirective, component],
            providers,
        });
        fixture = TestBed.createComponent(component);
        de = fixture.debugElement;
        fixture.detectChanges();
    }

    it("translate with a simple component", () => {
        setup(SimpleI18nComponent);
        expect(de.nativeElement.textContent).toContain("This is translated");
    });

    it("translate with arguments", () => {
        setup(ParameterI18nComponent);
        expect(de.nativeElement.textContent).toMatch(/There is +4 +values/);
        const countEl = de.query(By.css("bl-i18n .count"));
        expect(countEl).not.toBeFalsy();
        expect(countEl.nativeElement.textContent).toContain("4");
    });

});
