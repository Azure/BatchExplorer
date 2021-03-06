import { FormParameterType } from "../constants";
import { Form } from "../form";
import { FormParameter } from "../form-parameter";
import { FormSection } from "../form-section";

test("Can create a simple form and extract values", () => {
    const form = new Form({ id: "questions" });

    form.addChild(
        new FormParameter(form, {
            id: "name",
            label: "What is your name?",
            type: FormParameterType.String,
            value: "Sir Galahad",
        })
    );
    expect(form.getParameter("name").path).toBe("name");

    form.addChild(
        new FormSection(form, {
            id: "more_questions",
            label: "Some more questions",
        })
    );
    expect(form.getSection("more_questions").path).toBe("more_questions");

    form.getSection("more_questions").addChild(
        new FormParameter(form, {
            id: "color",
            label: "What is your favorite color?",
            type: FormParameterType.String,
            value: "Blue",
        })
    );

    form.initialize();

    expect(form.id).toBe("questions");
    expect(form.getChildren().length).toBe(2);

    const nameParam = form.getParameter("name");
    expect(nameParam.id).toBe("name");
    expect(nameParam.label).toBe("What is your name?");
    expect(nameParam.type).toBe("String");
    expect(nameParam.value).toBe("Sir Galahad");

    // TODO: Make these pass
    // const colorParam = form.getParameter("color");
    // expect(colorParam.value).toBe("Blue");

    // // Parameter values should be propogated to the parent form
    // expect(form.value).toStrictEqual({ name: "Sir Galahad", color: "Blue" });

    // colorParam.value = "Yellow";

    // // Parameter changes affect the overall form value map
    // expect(form.value).toStrictEqual({ name: "Sir Galahad", color: "Yellow" });
});

test("Validate IDs and paths", () => {
    // IDs can't contain dots (which are reserved for paths)
    expect(() => new Form({ id: "dots.arent.allowed" })).toThrow();

    const form = new Form({ id: "root" });
    const subFormOuter = new Form(form, { id: "outer" });
    const subFormInner = new Form(form, { id: "inner" });
    const outerFormParam = new FormParameter(form, {
        id: "testparam",
        type: FormParameterType.String,
    });
    const innerFormParam = new FormParameter(form, {
        id: "testparam",
        type: FormParameterType.String,
    });

    form.addChild(subFormOuter);
    subFormOuter.addChild(outerFormParam);
    subFormOuter.addChild(subFormInner);
    subFormInner.addChild(innerFormParam);

    // ID vs fully qualified ID
    expect(form.id).toBe("root");
    expect(form.path).toBeUndefined();
    expect(subFormOuter.id).toBe("outer");
    expect(subFormOuter.path).toBe("outer");
    expect(subFormInner.id).toBe("inner");
    expect(subFormInner.path).toBe("outer.inner");
    expect(outerFormParam.id).toBe("testparam");
    expect(outerFormParam.path).toBe("outer.testparam");
    expect(innerFormParam.id).toBe("testparam");
    expect(innerFormParam.path).toBe("outer.inner.testparam");

    // Can't add an entry with a duplicate ID to a form
    expect(() => {
        subFormInner.addChild(
            new FormParameter(form, {
                id: "testparam",
                type: FormParameterType.Number,
            })
        );
    }).toThrow();
});
