import { delayedCallback } from "../../util";
import {
    createForm, FormValues, ParameterType, ValidationStatus
} from "../form";

describe("Form tests", () => {
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
        expect(form.values.registeredDrivers).toEqual([
            "George",
            "Abe",
            "Teddy",
        ]);

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

    test("Form validation", async () => {
        const form = createNationalParkForm();

        const validationPromise = form.validate();

        // Validation is async, so status will not be defined until
        // all validation promises resolve
        expect(form.validationStatus).toBeUndefined();

        await validationPromise;

        // When there are multiple errors, the message includes the
        // error count
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual("2 errors found");
        expect(form.entryValidationStatus.parkName?.level).toEqual("error");
        expect(form.entryValidationStatus.parkName?.message).toEqual(
            "Park name is required"
        );
        expect(form.entryValidationStatus.state?.level).toEqual("error");
        expect(form.entryValidationStatus.state?.message).toEqual(
            "State is required"
        );

        form.values.parkName = "Yosemite";
        await form.validate();
        // Required validation takes precedence over onValidate()
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual("State is required");

        form.values.state = "California";
        await form.validate();
        // The state is now defined, but still invalid due to onValidate()
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "State must be exactly 2 characters"
        );

        form.values.state = "CA";
        await form.validate();
        // Good
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // Add a parameter with async validation
        form.param("squareMiles", ParameterType.Number, {
            onValidateAsync: async (value) => {
                return delayedCallback(() => {
                    if (value != null) {
                        if (typeof value !== "number") {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a number"
                            );
                        }
                        if (value <= 0) {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a positive number"
                            );
                        }
                    }
                    return new ValidationStatus("ok");
                }, 0);
            },
        });

        // Still valid when squareMiles is undefined
        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // Invalid square mileage
        form.values.squareMiles = -123;
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "Mileage must be a positive number"
        );

        form.values.squareMiles = 1187;
        // Good
        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // When calling validate() multiple times in rapid succession,
        // the last call always wins
        form.values.squareMiles = -1;
        form.validate();
        form.values.squareMiles = 1;
        form.validate();
        form.values.squareMiles = "not-a-number" as unknown as number;
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "Mileage must be a number"
        );

        // Make the form valid again
        form.values.squareMiles = 1;

        // Subsequence calls to validate() will cancel snapshots which
        // are in progress, but not if force is true
        const validateAndPreempt = (force: boolean = false) => {
            const promise = form.validate({ force });
            form.validate();
            return promise;
        };
        expect((await validateAndPreempt()).overallStatus?.level).toEqual(
            "canceled"
        );
        expect((await validateAndPreempt(true)).overallStatus?.level).toEqual(
            "ok"
        );
    });

    test("Form waitForValidation() function", async () => {
        const form = createNationalParkForm();

        // Add a parameter with async validation
        form.param("squareMiles", ParameterType.Number, {
            required: true,
            onValidateAsync: async (value) => {
                return delayedCallback(() => {
                    if (value != null) {
                        if (typeof value !== "number") {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a number"
                            );
                        }
                        if (value <= 0) {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a positive number"
                            );
                        }
                    }
                    return new ValidationStatus("ok");
                }, 0);
            },
        });

        // Begin in an error state
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.entryValidationStatus.parkName?.level).toEqual("error");
        expect(form.entryValidationStatus.state?.level).toEqual("error");
        expect(form.entryValidationStatus.squareMiles?.level).toEqual("error");

        // Because waitForValidation() is always non-blocking, calling
        // it first here will still wait for subsequent blocking
        // calls to validate() to finish
        const validationPromise = form.waitForValidation();

        // Trigger many validations in a row, importantly including an async
        // validation so that the promise returned by waitForValidation() will
        // not immediately resolve. The form starts out in an invalid state
        // due to squareMiles and state.
        form.values.parkName = "Yosemite";
        form.validate();
        form.values.squareMiles = -123;
        form.validate();
        form.values.state = "invalid";
        form.validate();
        form.values.squareMiles = 1187;
        form.validate();
        form.values.state = "CA";
        form.validate(); // Only this call actually makes the form valid

        const validationStatus = await validationPromise;
        expect(form.validationStatus?.level).toEqual("ok");

        // Form's validation status and the one returned by waitForValidation()
        // should be the exact same object reference
        expect(validationStatus).toBe(form.validationStatus);
    });


    test("onChange()", () => {
        type ElfType = {
            name: string;
            type: "Valyar" | "Noldor" | "Telerin";
        };
        const form = createForm<{
            hobbit: string;
            dwarf: string;
            elf?: ElfType;
        }>({
            values: {
                hobbit: "Bilbo",
                dwarf: "Gimli",
            },
        });

        form.param("hobbit", ParameterType.String);

        const onChangeSpy = jest.fn();
        const listener = form.onChange(onChangeSpy);

        form.updateValue("hobbit", "Frodo");

        expect(onChangeSpy).toHaveBeenCalledWith(
            {
                hobbit: "Frodo",
                dwarf: "Gimli",
            },
            {
                hobbit: "Bilbo",
                dwarf: "Gimli",
            }
        );
        form.removeOnChange(listener);
        onChangeSpy.mockClear();

        form.updateValue("dwarf", "Thorin");
        expect(onChangeSpy).not.toHaveBeenCalled();

        const elfForm = form.subForm(
            "elf",
            createForm<ElfType>({
                values: {
                    type: "Noldor",
                    name: "Gil-Galad",
                },
            })
        );

        const elfChangeSpy = jest.fn();
        const elfListener = elfForm.onChange(elfChangeSpy);
        elfForm.updateValue("name", "Galadriel");

        expect(elfChangeSpy).toHaveBeenCalledWith(
            {
                type: "Noldor",
                name: "Galadriel",
            },
            {
                type: "Noldor",
                name: "Gil-Galad",
            }
        );
        elfForm.removeOnChange(elfListener);
        elfChangeSpy.mockClear();

        elfForm.updateValue("name", "Feanor");
        expect(elfChangeSpy).not.toHaveBeenCalled();
    });
});

function createNationalParkForm() {
    type NationalParkFormValues = {
        parkName?: string;
        state?: string;
        squareMiles?: number;
    };

    const form = createForm<NationalParkFormValues>({
        values: {},
    });

    form.param("parkName", ParameterType.String, {
        label: "Park name",
        required: true,
    });

    form.param("state", ParameterType.String, {
        required: true,
        onValidateAsync: async (value) => {
            if (value && value.length === 2) {
                return new ValidationStatus("ok");
            }
            return new ValidationStatus(
                "error",
                "State must be exactly 2 characters"
            );
        },
    });

    return form;
}
