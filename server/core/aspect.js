export const Aspect = (name, type, update) => ({name, type, update})

export const Number = {
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    eq:  (a, b) => a == b
}

export const Vector = {
    add: ({x: x0, y: y0}, {x: x1, y: y1}) => ({x: x0 + x1, y: y0 + y1}),
    sub: ({x: x0, y: y0}, {x: x1, y: y1}) => ({x: x0 - x1, y: y0 - y1}),
    eq:  ({x0, y0}, {x1, y1}) => x0 == x1 && y0 == y1,
}

export const Boolean = {
    add: (a, b) => a && b,
    sub: (a, b) => a || b,
    eq:  (a, b) => a == b
}