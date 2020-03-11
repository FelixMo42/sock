var Validator = require('jsonschema').Validator
var validator = new Validator()

validator.action = "/action"

validator.addSchema({
    "id": validator.action,
    "type": "object",
    "properties": {

    },
    "required": ["country"]
}, validator.action)

module.exports = this.validator