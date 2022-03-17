import { createForm, ParameterType, FormValues } from "../form";

test("Single parameter form", () => {
    const form = createForm<{
        message: string;
    }>({
        values: {
            message: "Hello world!",
        },
    });
    expect(form.allEntriesCount).toEqual(0);
    expect(form.values).toEqual({ message: "Hello world!" });

    const messageParam = form.param("message", ParameterType.String, {
        value: "Hello galaxy!",
    });
    expect(form.allEntriesCount).toEqual(1);
    expect(form.values).toEqual({ message: "Hello galaxy!" });

    messageParam.value = "Hello universe!";
    expect(form.values).toEqual({ message: "Hello universe!" });

    // Can't add duplicate parameters
    expect(() => form.param("message", ParameterType.String)).toThrow();
});

test("Multi-parameter form with nested sections", () => {
    type CarFormValues = {
        make?: "Ford" | "Tesla" | "Volkswagen";
        model?: string;
        milesPerCharge?: number;
        registeredDrivers?: string[];
        maxRegisteredDrivers?: number;
    };

    const form = createForm<CarFormValues>({
        values: {
            make: "Tesla",
        },
    });
    form.param("make", ParameterType.String, {
        label: "Make",
    });
    form.param("model", ParameterType.String, {
        label: "Model",
        value: "Model Y",
    });
    form.param("milesPerCharge", ParameterType.Number, {
        label: "Miles per charge",
    });

    // Top-level section
    const driversSection = form.section("Drivers");
    driversSection.param("registeredDrivers", ParameterType.StringList, {
        label: "Drivers",
    });
    expect(form.values).toEqual({ make: "Tesla", model: "Model Y" });

    // Global entry count
    expect(form.allEntriesCount).toEqual(5);

    // Direct child count
    expect(form.childEntriesCount).toEqual(4);
    expect(driversSection.childEntriesCount).toEqual(1);

    // Nested section
    const advancedSection = driversSection.section("Advanced");
    advancedSection.param("maxRegisteredDrivers", ParameterType.Number);

    // Check that counts were updated correctly
    expect(form.allEntriesCount).toEqual(7);
    expect(form.childEntriesCount).toEqual(4);
    expect(driversSection.childEntriesCount).toEqual(2);
    expect(advancedSection.childEntriesCount).toEqual(1);

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

test("Form with a sub-form", () => {
    interface TrollFormValues extends FormValues {
        applicant?: string;
        applicantHouseholdSize?: number;
        answers?: TrollAnswersFormValues;
    }

    interface TrollAnswersFormValues extends FormValues {
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
