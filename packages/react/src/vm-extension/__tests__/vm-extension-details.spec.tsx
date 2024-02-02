import { render } from "@testing-library/react";
import { failedExtItem, succeededExtItem } from "../mock-vme-ext-items";
import * as React from "react";
import { initMockBrowserEnvironment } from "@azure/bonito-ui";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";
import { translate } from "@azure/bonito-core";
import { VmExtensionDetails } from "../vm-extension-details";

describe("VmExtensionDetails", () => {
    beforeEach(() => initMockBrowserEnvironment());

    it("should render with the required properties", async () => {
        const { container, getByText } = render(
            <VmExtensionDetails vme={succeededExtItem} />
        );
        getByText(translate("lib.react.vmExtension.name"));
        getByText(succeededExtItem.name);
        getByText(translate("lib.react.vmExtension.type"));
        getByText(translate("lib.react.vmExtension.version"));
        getByText(translate("lib.react.vmExtension.publisher"));
        getByText(translate("lib.react.vmExtension.autoUpdate"));
        expect(await runAxe(container)).toHaveNoViolations();
    });

    it("should render status if available", async () => {
        const { getAllByText } = render(
            <VmExtensionDetails vme={succeededExtItem} />
        );
        expect(
            getAllByText(translate("lib.react.vmExtension.status"))
        ).toHaveLength(2);
        getAllByText("Provisioning succeeded");
    });

    it("should detailed status if subStatus avaliable", async () => {
        const { getByText } = render(
            <VmExtensionDetails vme={failedExtItem} />
        );
        expect(
            getByText(translate("lib.react.vmExtension.detailedStatus"))
        ).toBeTruthy();
    });

    it("should not render detailed status if subStatus not avaliable", async () => {
        const { getByText } = render(
            <VmExtensionDetails vme={succeededExtItem} />
        );
        expect(() =>
            getByText(translate("lib.react.vmExtension.detailedStatus"))
        ).toThrow();
    });

    it("should render settings if available", async () => {
        const { getByText } = render(
            <VmExtensionDetails vme={succeededExtItem} />
        );
        getByText(translate("lib.react.vmExtension.settings"));
    });
});
