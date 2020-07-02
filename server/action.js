import { fire }  from "eventmonger"
import { effects } from "./effect.js"
import { updatePlayerEvent, getPlayer, hasPlayer, setPlayer } from "./manager.js"
import { inRange } from "./util.js"

/**
 * @typedef Action
 * @property {*} id 
 * @property {*} name 
 * @property {*} expects 
 * @property {*} targets
 * @property {*} effects
 */

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

/*////////////////*/
/*| the resolver |*/
/*////////////////*/

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

/*///////////////////*/
/*| the apply chain |*/
/*///////////////////*/

export const applyAction = (action, source, inputs, changes) => {
    if ( !isValidInputs(action, source, inputs) ) return

    let resolve = Resolver(action, source, inputs)

    let target = resolve( action.targets )

    for (let [effect, value] of action.effects) applyEffect(effect, resolve(value), target, changes)
}

export const applyEffect = (effect, value, target, changes) => {
    effects.get(effect).apply(target, value).forEach(change => applyChange(target, change, changes))
}

export const applyChange = (target, [aspect, value], changes) => {
    if ( !changes.has(target) ) changes.set(target, new Map())

    let change = changes.get( target )

    change.set(aspect, aspect.type.add(value, change.has(aspect) ? change.get(aspect) : target[aspect.name]))
}

/*////////*/
/*| misc |*/
/*////////*/

export const updatePlayer = (changes, player) => {
    let update = {}

    for (let [aspect, value] of changes.entries()) {
        let newValue = aspect.update(player, value)

        update[aspect.name] = newValue

        setPlayer(player, aspect, newValue)
    }

    fire(updatePlayerEvent, { player : player.id , update })
}