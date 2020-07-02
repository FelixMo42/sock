import uuid from "uuid"
import { Event, fire }  from "eventmonger"
import { players } from "../database.js"

export const playerCreated = Event()
export const playerUpdated = Event()
export const playerRemoved = Event()

export const createPlayer = config => {
    let player = {
        // set the defaults
        id: uuid.v1(),
        position: {x: 0, y: 0},
        hp: 100, maxhp: 100,
        mp: 100, maxmp: 100,

        // load in the overrides
        ...config
    }

    // write the player into the database
    players.set(player.id, player).write()

    // tell the world the news of the new player
    fire(playerCreated, player)

    return player
}

export const updatePlayer = (changes, player) => {
    let update = {}

    for (let [aspect, value] of changes.entries()) {
        let newValue = aspect.update(player, value)

        update[aspect.name] = newValue

        setPlayer(player, aspect, newValue)
    }

    fire(playerUpdated, { player : player.id , update })
}

export const removePlayer = player => {
    // give the world fair warning of are actions
    fire(defaultPlayerEvent, player)

    // and remove it from the database
    players.unset(player)
}

export const getPlayer = id => players.get(id).value()
export const hasPlayer = id => players.has(id).value()
export const getPlayers = () => players.values()
export const setPlayer = (player, aspect, value) => players.get(player.id).set(aspect.name, value).write()