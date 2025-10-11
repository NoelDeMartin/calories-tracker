function flatten(values: (number | number[])[]): number[] {
    return values.flatMap((value) => (Array.isArray(value) ? value : [value]));
}

export function average(...values: (number | number[])[]): number {
    const flat = flatten(values);

    return sum(flat) / flat.length;
}

export function sum(...values: (number | number[])[]): number {
    return flatten(values).reduce((acc, value) => acc + value, 0);
}

export function max(...values: (number | number[])[]): number {
    return Math.max(...flatten(values));
}

export function min(...values: (number | number[])[]): number {
    return Math.min(...flatten(values));
}
