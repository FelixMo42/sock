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

export const clear = (tables=["players", "objects"]) => {
    for (let table of tables) root.set(table, {})
    root.write()
}

export const generate = () => {
    clear()
}