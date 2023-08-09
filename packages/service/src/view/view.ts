import type { HttpResponse } from "@azure/bonito-core/lib/http";

export interface View {
    loading: boolean;
    httpResponse?: HttpResponse;
}
