import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { I18N_NAMESPACE, I18nPipe } from "./i18n.pipe";

@Component({
    template: `{{'my-key.label' | i18n}}`,
})
class SimplePipeComponent {
}

@Component({
    template: `{{'my-param.label' | i18n: {count: 4} }}`,
})
class ParameterPipeComponent {
}

@Component({
    template: `{{'foo.label' | i18n }}`,
})
class NamespacePipeComponent {
}

const translations = {
    "my-key.label": "This is translated",
    "my-param.label": "There is {count} values",
    "my-namespace.foo.label": "Namespaced translation",
};

describe("i18n.pipe", () => {
    let fixture: ComponentFixture<any>;
    let de: DebugElement;

    function setup(component, providers?) {
        TestBed.configureTestingModule({
            imports: [I18nTestingModule.withTranslations(translations)],
            declarations: [I18nPipe, component],
            providers,
        });
        fixture = TestBed.createComponent(component);
        de = fixture.debugElement;
        fixture.detectChanges();
    }

    it("translate with a simple pipe", () => {
        setup(SimplePipeComponent);
        expect(de.nativeElement.textContent).toContain("This is translated");
    });

    it("translate with a pipe with arguments", () => {
        setup(ParameterPipeComponent);
        expect(de.nativeElement.textContent).toContain("There is 4 values");
    });

    it("translate with a pipe using namespace", () => {
        setup(NamespacePipeComponent, [
            { provide: I18N_NAMESPACE, useValue: "my-namespace" },
        ]);
        expect(de.nativeElement.textContent).toContain("Namespaced translation");
    });
});
