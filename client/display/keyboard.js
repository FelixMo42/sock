import { Event, fire } from "eventmonger"

// list of which keys are down
const keysDown = new Set()

// keyboard events
export const keyDown = Event()
export const keyUp   = Event()

window.addEventListener("keydown", event => {
    keysDown.add(event.keyCode)

    fire(keyDown, event.keyCode)
})

window.addEventListener("keyup", event => {
    keysDown.delete(event.keyCode)

    fire(keyUp, event.keyCode)
})

export const isDown = (key) => keysDown.has(key)

export const isNumeric = keyCode => keyCode >= 48 && keyCode <= 57

export const asNumber  = keyCode => isNumeric(keyCode) ? keyCode - 48 : -1

export const BACKSPACE = 8
export const TAB = 9
export const ENTER = 13
export const SHIFT = 16
export const PAUSE = 19
export const CTRL = 17
export const ALT = 18
export const CAPS_LOCK = 20
export const ESCAPE = 27
export const SPACE = 32
export const PAGE_UP = 33
export const PAGE_DOWN = 34
export const END = 35
export const HOME = 36
export const LEFT = 37
export const UP = 38
export const RIGHT = 39
export const DOWN = 40
export const PRINT_SCREEN = 44
export const INSERT = 45
export const DELETE = 46
export const _0 = 48
export const _1 = 49
export const _2 = 50
export const _3 = 51
export const _4 = 52
export const _5 = 53
export const _6 = 54
export const _7 = 55
export const _8 = 56
export const _9 = 57
export const A = 65
export const B = 66
export const C = 67
export const D = 68
export const E = 69
export const F = 70
export const G = 71
export const H = 72
export const I = 73
export const J = 74
export const K = 75
export const L = 76
export const M = 77
export const N = 78
export const O = 79
export const P = 80
export const Q = 81
export const R = 82
export const S = 83
export const T = 84
export const U = 85
export const V = 86
export const W = 87
export const X = 88
export const Y = 89
export const Z = 90
export const CMD = 91
export const CMD_RIGHT = 93
export const NUM_0 = 96
export const NUM_1 = 97
export const NUM_2 = 98
export const NUM_3 = 99
export const NUM_4 = 100
export const NUM_5 = 101
export const NUM_6 = 102
export const NUM_7 = 103
export const NUM_8 = 104
export const NUM_9 = 105
export const MULTIPLY = 106
export const ADD = 107
export const SUBTRACT = 109
export const DECIMAL_POINT = 110
export const DIVIDE = 111
export const F1 = 112
export const F2 = 113
export const F3 = 114
export const F4 = 115
export const F5 = 116
export const F6 = 117
export const F7 = 118
export const F8 = 119
export const F9 = 120
export const F10 = 121
export const F11 = 122
export const F12 = 123
export const NUM_LOCK = 144
export const SCROLL_LOCK = 145
export const SEMI_COLON = 186
export const EQUAL = 187
export const COMMA = 188
export const DASH = 189
export const PERIOD = 190
export const FORWARD_SLASH = 191
export const OPEN_BRACKET = 219
export const BACK_SLASH = 220
export const CLOSE_BRACKET = 221
export const SINGLE_QUOTE = 222