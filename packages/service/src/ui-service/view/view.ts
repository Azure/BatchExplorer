import type { HttpResponse } from "@batch/ui-common/lib/http";

export interface View {
    loading: boolean;
    httpResponse?: HttpResponse;
}
