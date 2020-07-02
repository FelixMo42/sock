import uuid from "uuid"
import { Event, fire } from "eventmonger"
import { objects } from "../database.js"

export const createObjectEvent = Event()
export const updateObjectEvent = Event()
export const removeObjectEvent = Event()

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

export const getObject = id => objects.get(id).value()
export const hasObject = id => objects.has(id).value()
export const getObjects = () => objects.values()