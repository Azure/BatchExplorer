import { render, waitFor } from "@testing-library/react";
import React from "react";
import { translate } from "@azure/bonito-core";
import { initMockBatchBrowserEnvironment } from "../../environment";
import { NodeVMExtList } from "../node-vm-ext-list";
import { dataGridIgnoredA11yRules } from "@azure/bonito-ui/lib/components/data-grid/test-ignore-a11y-rules";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";

describe("NodeVMExtList", () => {
    beforeEach(() => {
        initMockBatchBrowserEnvironment();
    });

    it("should render vm extension lists", async () => {
        const { getByText, container } = render(
            <NodeVMExtList
                accountEndpoint="dummy_endpoint"
                poolId={"dummy_pool"}
                nodeId="tvmps_id1"
            />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() => getByText("CustomExtension100"));
        expect(
            await runAxe(container, dataGridIgnoredA11yRules)
        ).toHaveNoViolations();
    });

    it("should render vm extension lists with no result", async () => {
        const { getByText } = render(
            <NodeVMExtList
                accountEndpoint="dummy_endpoint"
                poolId={"dummy_pool"}
                nodeId="non_exist_node_id"
            />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() =>
            getByText(translate("lib.react.vmExtension.noResult"))
        );
    });
});
