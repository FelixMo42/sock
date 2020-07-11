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
    let object = {
        id: uuid.v1(), supertype: type.supertype, prototype: type.prototype,
        ...Object.assign({ ...type.values }, data)
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

/*////////////////////*/
/*| typing functions |*/
/*////////////////////*/

let typeid = 0

export const supertype = (...aspects) => ({
    supertype : typeid++,

    required : aspects,
    values : {}
})

export const prototype = (parent, ...defaults) => ({
    supertype : parent.supertype,
    prototype : typeid++,

    values : Object.assign({ ...parent.values },
        Object.fromEntries(defaults.map(([key, val]) => [key.name, val]))
    )
})