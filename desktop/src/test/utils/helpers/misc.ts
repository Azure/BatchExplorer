export function delay(time: number = 0) {
    return new Promise(r => setTimeout(r, time));
}
