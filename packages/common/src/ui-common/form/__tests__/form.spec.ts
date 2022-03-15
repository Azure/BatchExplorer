import { createForm, ParameterType } from "../form";

test("Single parameter form", () => {
    const form = createForm<{
        message: string;
    }>({
        values: {
            message: "Hello world!",
        },
    });
    expect(form.entryCount).toEqual(0);
    expect(form.values).toEqual({ message: "Hello world!" });

    const messageParam = form.param("message", ParameterType.String, {
        value: "Hello galaxy!",
    });
    expect(form.entryCount).toEqual(1);
    expect(form.values).toEqual({ message: "Hello galaxy!" });

    messageParam.value = "Hello universe!";
    expect(form.values).toEqual({ message: "Hello universe!" });

    // Can't add duplicate parameters
    expect(() => form.param("message", ParameterType.String)).toThrow();
});

test("Multi-parameter form with sections", () => {
    const form = createForm<{
        make?: "Ford" | "Tesla" | "Volkswagen";
        model?: string;
        milesPerCharge?: number;
        registeredDrivers?: string[];
    }>({
        values: {
            make: "Tesla",
        },
    });
    form.param("make", ParameterType.String, {
        title: "Make",
    });
    form.param("model", ParameterType.String, {
        title: "Model",
        value: "Model Y",
    });
    form.param("milesPerCharge", ParameterType.Number, {
        title: "Miles per charge",
    });
    form.param("registeredDrivers", ParameterType.StringList, {
        title: "Drivers",
    });
    expect(form.values).toEqual({ make: "Tesla", model: "Model Y" });
    expect(form.entryCount).toEqual(4);

    form.values = {
        make: "Ford",
        model: "Mustang Mach E",
        milesPerCharge: 300,
        registeredDrivers: ["George", "Abe"],
    };
    expect(form.values.registeredDrivers).toEqual(["George", "Abe"]);

    // Add a driver by changing the parameter
    const driversParam = form.getParam("registeredDrivers");
    driversParam.value = ["George", "Abe", "Teddy"];
    expect(form.values.registeredDrivers).toEqual(["George", "Abe", "Teddy"]);

    // Other values are not affected
    expect(form.values.milesPerCharge).toEqual(300);
});

test("Can create a nested form", () => {
    interface TrollFormValues extends Record<string, unknown> {
        applicant?: string;
        applicantHouseholdSize?: number;
        answers?: TrollAnswersFormValues;
    }

    interface TrollAnswersFormValues extends Record<string, unknown> {
        color?: string;
        sparrowVelocity?: number;
    }

    const form = createForm<TrollFormValues>({
        values: {
            applicant: "Sir Gallahad",
        },
    });
    expect(form.values).toEqual({ applicant: "Sir Gallahad" });

    const applicantSection = form.section("Applicant Info");

    applicantSection.param("applicant", ParameterType.String, {
        value: "Sir Lancelot",
    });
    expect(form.values).toEqual({ applicant: "Sir Lancelot" });

    applicantSection.param("applicantHouseholdSize", ParameterType.Number, {
        value: 2,
    });
    expect(form.values).toEqual({
        applicant: "Sir Lancelot",
        applicantHouseholdSize: 2,
    });

    const subForm = form.subForm(
        "answers",
        createForm<TrollAnswersFormValues>({
            values: {
                color: "red",
            },
        })
    );
    expect(subForm.values).toEqual({
        color: "red",
    });
    expect(form.values).toEqual({
        applicant: "Sir Lancelot",
        applicantHouseholdSize: 2,
        answers: {
            color: "red",
        },
    });
});
