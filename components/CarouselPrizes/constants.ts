// export const CONFIG = {
//     GAP: 16,
//     BASE_WIDTH: 220,
//     BASE_HEIGHT: 120,
//     MIN_WIDTH: 140,
//     MIN_HEIGHT: 80,
//     ANIMATION_DURATION: 2500,
//     RETURN_DURATION: 400,
//     FULL_CYCLES: 3,
//     VISIBILITY_THRESHOLD: 2.5,
//     SCALE_FACTOR: 0.4,
//     OPACITY_FACTOR: 0.6,
//     BLUR_THRESHOLD: 1,
//     CENTER_THRESHOLD: 0.3,
// } as const

// export const easeInOutCubic = (t: number): number => {
//     return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
// }

// export const easeOutQuart = (t: number): number => {
//     return 1 - Math.pow(1 - t, 4)
// }

//===========

export const CONFIG = {
    GAP: 20,
    BASE_WIDTH: 320,
    BASE_HEIGHT: 280,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 250,
    ANIMATION_DURATION: 2500,
    RETURN_DURATION: 400,
    FULL_CYCLES: 3,
    VISIBILITY_THRESHOLD: 2.5,
    SCALE_FACTOR: 0.4,
    OPACITY_FACTOR: 0.6,
    BLUR_THRESHOLD: 1,
    CENTER_THRESHOLD: 0.3,
} as const

export const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4)
}