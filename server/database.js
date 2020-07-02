import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'

// where is this titular database
const file = "./.database.json"

// just a nice little utility function
const root = low(new FileSync(file))

// make sure the two categories are there
root.defaults({
    players: {},
    objects: {}
}).write()

// set up the databases
export const players = root.get("players")
export const objects = root.get("objects")
export const actions = low(new FileSync("./.actions.json"))

export const clear = (tables=["players", "objects"]) => {
    for (let table of tables) root.set(table, {})
    root.write()
}

export const generate = () => {
    clear()
}