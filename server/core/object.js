import uuid from "uuid"
import { Event, fire }  from "eventmonger"
import { objects } from "../database.js"

export const objectCreated = Event()
export const objectUpdated = Event()
export const objectRemoved = Event()

/*///////////////////////*/
/*| lifecycle functions |*/
/*///////////////////////*/

export const createObject = config => {
    let object = {
        // set the defaults
        id: uuid.v1(),
        position: {x: 0, y: 0},
        hp: 100, maxhp: 100,
        mp: 100, maxmp: 100,
        width: 1, height: 1,

        // load in the overrides
        ...config
    }

    // write the object into the database
    objects.set(object.id, object).write()

    // tell the world the news of the new object
    fire(objectCreated, object)

    return object
}

export const updateObject = (changes, object) => {
    let update = {}
    let dead = false

    for (let [aspect, value] of changes.entries()) {
        let newValue = aspect.update(object, value, () => dead = true)

        update[aspect.name] = newValue

        setObject(object, aspect, newValue)
    }

    if (dead) {
        removeObject(object)
    } else {
        fire(objectUpdated, { object : object.id , update })
    }
}

export const removeObject = object => {
    // give the world fair warning of are actions
    fire(objectRemoved, object)

    // and remove it from the database
    objects.unset(object.id).write()
}

/*//////////////////////*/
/*| database functions |*/
/*//////////////////////*/

export const getObject = id => objects.get(id).value()
export const hasObject = id => objects.has(id).value()
export const getObjects = () => objects.values()
export const setObject = (object, aspect, value) => objects.get(object.id).set(aspect.name, value).write()