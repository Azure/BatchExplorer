export function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
    return input != null;
}
