import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'

// where is this titular database
const file = "./.database.json"

// just a nice little utility function
const root = low(new FileSync(file))

// make sure the three categories are there
root.defaults({
    players: {},
    objects: {},
    actions: {}
}).write()

// set up the databases
export const players = root.get("players")
export const objects = root.get("objects")
export const actions = root.get("actions")

export const clear = () => {
    root.set("players", {})
        .set("objects", {})
        .write()

    console.log("cleared players and objects from db.")
}

export const generate = () => {
    clear()
}