// FILEPATH: /c:/Users/hoppe/work/sandbox/BatchExplorer/packages/react/src/vm-extension/__tests__/vm-extension-list.spec.tsx

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VmExtensionList } from "../vm-extension-list";
import {
    allExtItems,
    failedExtItem,
    noProvisioningStateExtItem,
    succeededExtItem,
} from "../mock-vm-ext-items";
import * as React from "react";
import { initMockBrowserEnvironment } from "@azure/bonito-ui";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";
import { translate } from "@azure/bonito-core";
import { dataGridIgnoredA11yRules } from "@azure/bonito-ui/lib/components/data-grid/test-ignore-a11y-rules";

describe("VmExtensionList", () => {
    const user = userEvent.setup();
    beforeEach(() => initMockBrowserEnvironment());

    it("renders search box and table", async () => {
        const { container, getByRole, getByText } = render(
            <VmExtensionList loading={false} extensions={allExtItems} />
        );
        getByRole("searchbox");
        getByRole("grid");
        getByText(translate("lib.react.vmExtension.name"));
        getByText(translate("lib.react.vmExtension.type"));
        getByText(translate("lib.react.vmExtension.version"));
        getByText(translate("lib.react.vmExtension.autoUpdate"));
        expect(
            await runAxe(container, dataGridIgnoredA11yRules)
        ).toHaveNoViolations();
    });

    it("should filter extensions", async () => {
        const { getByRole, getByText } = render(
            <VmExtensionList loading={false} extensions={[succeededExtItem]} />
        );

        const searchBox = getByRole("searchbox");

        getByText("SuccessExtension");
        expect(() =>
            getByText(translate("lib.react.vmExtension.noResult"))
        ).toThrow();

        await user.type(searchBox, "fail");

        expect(() => getByText("SuccessExtension")).toThrow();
        getByText(translate("lib.react.vmExtension.noResult"));
    });

    it("should display state if available", async () => {
        const { getByText } = render(
            <VmExtensionList loading={false} extensions={[failedExtItem]} />
        );
        getByText(translate("lib.react.vmExtension.provisioningState"));

        getByText("FailedExtension");
        getByText("Failed");
    });

    it("should not display state if not available", async () => {
        const { getByText } = render(
            <VmExtensionList
                loading={false}
                extensions={[noProvisioningStateExtItem]}
            />
        );
        expect(() =>
            getByText(translate("lib.react.vmExtension.provisioningState"))
        ).toThrow();
    });

    it("should fire onItemClick", async () => {
        const mockOnItemClick = jest.fn();
        const { getByText } = render(
            <VmExtensionList
                loading={false}
                extensions={[succeededExtItem]}
                onItemClick={mockOnItemClick}
            />
        );
        const link = getByText("SuccessExtension");
        await user.click(link);
        expect(mockOnItemClick).toBeCalledWith(succeededExtItem);
    });
});
