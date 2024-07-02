import * as React from "react";
import { Stack } from "@fluentui/react/lib/Stack";
import { IconButton } from "@fluentui/react/lib/Button";
import { Footer, FooterIcon, FooterRight } from "../grid-utlis.styles";

interface GridFooterProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    //  goToPage: (num: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
}

export const GridFooter = (props: GridFooterProps) => {
    const {
        currentPage,
        pageSize,
        totalItems,
        //   goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
    } = props;

    return (
        <Stack grow horizontal horizontalAlign="space-between">
            <Stack.Item style={Footer}>
                <Stack grow horizontal horizontalAlign="space-between">
                    <Stack.Item grow={1} align="center">
                        {(currentPage - 1) * pageSize + 1} -{" "}
                        {pageSize * currentPage} of {totalItems}
                    </Stack.Item>
                    <Stack.Item grow={1} about="center" style={FooterRight}>
                        <IconButton
                            style={FooterIcon}
                            iconProps={{ iconName: "DoubleChevronLeft" }}
                            onClick={firstPage}
                        />
                        <IconButton
                            style={FooterIcon}
                            iconProps={{ iconName: "ChevronLeft" }}
                            onClick={previousPage}
                        />
                        <span>Page {currentPage}</span>
                        <IconButton
                            style={FooterIcon}
                            iconProps={{ iconName: "ChevronRight" }}
                            onClick={nextPage}
                        />
                        <IconButton
                            style={FooterIcon}
                            iconProps={{ iconName: "DoubleChevronRight" }}
                            onClick={lastPage}
                        />
                    </Stack.Item>
                </Stack>
            </Stack.Item>
        </Stack>
    );
};
