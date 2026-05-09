export const clamp = (min: number, max: number, v: number) =>
    v > max ? max : v < min ? min : v
