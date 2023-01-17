export function fixValue(val: number, MIN: number, MAX: number): number {
    if (!Number.isFinite(val) || val < MIN) {
        console.warn(`Invalid value \"val\". Setting to MIN \"MIN\"`);
        val = MIN;
    } else if (val > MAX) {
        console.warn(`Invalid value \"val\". Setting to MAX \"MAX\"`);
        val = MAX;
    }
    return val;
}
