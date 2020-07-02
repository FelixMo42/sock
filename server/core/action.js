import { inRange } from "../util.js"
import { actions } from "../database.js"
import { applyEffect } from "./effect.js"
import { getPlayer, hasPlayer } from "./player.js"

/**
 * @typedef Action
 * @property {*} id 
 * @property {*} name 
 * @property {*} expects 
 * @property {*} targets
 * @property {*} effects
 */

/*////////////////////*/
/*| action functions |*/
/*////////////////////*/

export const getAction = id => actions.get(id).value()

export const hasAction = id => actions.has(id).value()

export const getActions = () => actions.values()

/*///////////////////////////*/
/*| action input validation |*/
/*///////////////////////////*/

export const isValidInput = (source, input, expect) => {
    if (expect.type == "player") {
        if ( !hasPlayer(input) ) return false

        let player = getPlayer(input)

        return inRange(source.position, player.position, expect.range)
    }

    if (expect.type == "vector") {
        if ( !("x" in input && "y" in input) ) return false

        return inRange(source.position, input, expect.range)
    }

    console.error(`unkown input type ${expect.type}`)

    return false   
}

export const isValidInputs = (action, source, inputs) => {
    // must have the correct number of inputs
    if ( action.expects.length !== inputs.length ) return false

    // make sure they all match
    return action.expects.every((expect, i) => isValidInput(source, inputs[i], expect))
}

/*///////////////////////*/
/*| the mighty resolver |*/
/*///////////////////////*/

const getInput = (action, inputs, i) => {
    let expect = action.expects[i]

    if (expect.type == "vector") return inputs[i]

    if (expect.type == "player") return getPlayer(inputs[i])
}

const Resolver = (action, source, inputs) => (request) => {
    if ( typeof request !== "string" ) return request

    let path = request.split(".")

    if ( path[0] == "source" ) return source

    if ( path[0] == "inputs" ) return getInput(action, inputs, path[1])

    if ( path[0] == "input" ) return getInput(action, inputs, 0)
}

/*/////////*/
/*| apply |*/
/*/////////*/

export const applyAction = (action, source, inputs, changes) => {
    if ( !isValidInputs(action, source, inputs) ) return

    let resolve = Resolver(action, source, inputs)

    let target = resolve( action.targets )

    for (let [effect, value] of action.effects) applyEffect(effect, resolve(value), target, changes)
}