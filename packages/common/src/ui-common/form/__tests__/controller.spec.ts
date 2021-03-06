import { FormController } from "../form-controller";
import { Form } from "../form";
import { FormParameter } from "../form-parameter";

test("Can register and lookup a parameter", () => {
    const form = new Form({ id: "root" });
    const controller = new FormController(form);
    controller.register(form, new FormParameter(form, { id: "color" }));

    expect(controller.lookup("color")?.id).toBe("color");
    expect(controller.lookupRelative("", "color")?.id).toBe("color");
});

test("Can register and lookup subforms with parameters", () => {
    const form = new Form({ id: "root" });
    const controller = new FormController(form);

    const subForm = new Form(form, { id: "address" });
    form.addChild(subForm);

    const cityParam = new FormParameter(form, { id: "city" });
    const countryParam = new FormParameter(form, { id: "country" });
    subForm.addChild(cityParam);
    subForm.addChild(countryParam);

    controller.register(form, subForm);
    controller.register(subForm, cityParam);
    controller.register(subForm, countryParam);

    expect(cityParam.path).toBe("address.city");

    expect(controller.lookup("address")?.id).toBe("address");
    expect(controller.lookup("address.city")?.id).toBe("city");
});
