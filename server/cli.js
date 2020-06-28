const { program } = require('commander')
const { clear } = require('./database')

program
    .version('0.0.1')
    .command('clear').action(clear)

program.parse(process.argv)

/*//*/
/*||*/
/*//*/