export function fixValue(val: number, MIN: number, MAX: number): number {
    if (!Number.isFinite(val) || val < MIN) {
        console.warn(`Invalid value: \"${val}\". Setting to MIN: ${MIN}`);
        val = MIN;
    } else if (val > MAX) {
        console.warn(`Invalid value: \"${val}\". Setting to MAX: ${MAX}`);
        val = MAX;
    }
    return val;
}

export function checkIfFaulty(val: number, MIN: number, MAX: number): boolean {
    if (!Number.isFinite(val)) {
        console.error(`Invalid value: \"${val}\". Aborting`);
        return true;
    } else if (val < MIN) {
        console.error(`Invalid value: \"${val}\". It is less then \"${MIN}\". Aborting`);
        return true;
    } else if (val > MAX) {
        console.error(
            `Invalid value: \"${val}\". It is bigger then \"${MAX}\". Aborting`,
        );
        return true;
    }
    return false;
}
