const barter = require("./barter")
const express = require('express')
const http = require('http')


// serve up the actual website
const app = express()
app.use(express.static('client'))

// create the http server
const server = http.createServer(app)

let ask = barter(server, (client, question, respond) => {
    if (question == barter.clientJoined)
        console.log("new client")

    if (question == barter.clientLeft)
        console.log("client left")
})

// start the server
server.listen(4242, () => console.log('Listening on http://localhost:4242'))