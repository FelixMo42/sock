import { Event, fire } from "eventmonger"
import { app } from "../display/display"

const isUnique = variable =>
    (typeof variable == "object" ||
     typeof variable == "function")
    && variable !== null

const flags = new Map()

export const pack = (add=(a, b) => b) => (event, next) => {
    let dirty = false
    let value = null

    app.ticker.add(() => {
        if ( dirty ) {
            dirty = false
            next(event, value)
        }
    })

    return data => {
        dirty = true
        value = add(value, data)
    }
}

export const flag = (variable) => {
    if ( !isUnique(variable) ) return console.error("Can only flag objects or functions!")

    let event = Event( pack() )

    flags.set(variable, event)

    return event
}

export const effect = (variable) => {
    fire(flags.get(variable))
}

export const effects = (variable, func) => (arg) => {
    effect(variable)

    return func(arg)
}