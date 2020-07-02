import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'

// import the config file
import "./config.js"

// set up the databases
export const objects = low(new FileSync("./.objects.json"))
export const actions = low(new FileSync("./.actions.json"))