
import { Subject } from "rxjs";

export interface RequestContainer {
    request: JsonRpcRequest;
    subject: Subject<any>;

    /**
     * setTimeout id to clear the request if it timeout
     */
    timeout: any;
}

export interface RequestOptions {
    authentication?: any;
}

export interface JsonRpcRequest {
    jsonrpc: string;
    id: string;
    method: string;
    params: any[];
    options: RequestOptions;
}

export interface JsonRpcError {
    code: number;
    message: string;
    data: any;
}

export interface JsonRpcResponse {
    jsonrpc: string;
    id: string;
    result: any;
    stream: boolean;
    error: JsonRpcError;
}
