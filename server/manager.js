import uuid from "uuid"
import { Event, fire } from "eventmonger"
import { players, objects } from "./database.js"

export const createObjectEvent = Event()
export const updateObjectEvent = Event()
export const removeObjectEvent = Event()

export const createPlayerEvent = Event()
export const updatePlayerEvent = Event()
export const removePlayerEvent = Event()

/*////////////////////*/
/*| player functions |*/
/*////////////////////*/

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
    fire(createPlayerEvent, player)

    return player
}

export const removePlayer = player => {
    // give the world fair warning of are actions
    fire(defaultPlayerEvent, player)

    // and remove it from the database
    players.unset(player)
}

/*////////////////////*/
/*| object functions |*/
/*////////////////////*/

export const createObject = config => {
    let object = {
        // set the defaults
        id: uuid.v1(),
        x: 0, y: 0,
        width: 1,
        height: 1,

        // load in the overrides
        ...config
    }

    // write the object into the database
    objects.set(object.id, object).write()

    // tell the world the news of the new player
    fire(createObjectEvent, object)

    return object
}

export const removeObject = object => {
    // give the world fair warning of are actions
    fire(defaultObjectEvent, object)

    // and remove it from the database
    objects.unset(object)
}