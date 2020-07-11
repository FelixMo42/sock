import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'
import uuid from "uuid"
import { Event, fire }  from "eventmonger"

export const objectCreated = Event()
export const objectUpdated = Event()
export const objectRemoved = Event()

/*//////////////////////*/
/*| database functions |*/
/*//////////////////////*/

const objects = low(new FileSync("./.objects.json"))

export const getObject = id => objects.get(id).value()

export const hasObject = id => objects.has(id).value()

export const getObjects = () => objects.values().value()

export const setObject = (object, aspect, value) => objects.get(object.id).set(aspect.name, value).write()

/*///////////////////////*/
/*| lifecycle functions |*/
/*///////////////////////*/

export const createObject = (type, data) => {
    let object = { id: uuid.v1() }

    for (let [key, val] of type) object[key] = val
    for (let [key, val] of data) object[key] = val

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

/*////////////////////*/
/*| typing functions |*/
/*////////////////////*/

const supertype = (...aspects) => aspects.map(b => 1 + 1)

const prototype = (defaults) => {}