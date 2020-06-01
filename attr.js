const AspectType = (name, type) => ({name, type})
const EffectType = (name, type) => ({name, type})

const Aspect = (type, value) => ([type, value])
const Effect = (type, value, func) => ({type, value, func})

const Get = (agent, param) => agent.has(param) ? agent.get(param) : param.type.def()
const Add = (agent, param, value) => agent.set(param, param.type.add(Get(agent, param), value))

const Agent = aspects => new Map(aspects)
const Apply = (agent, effect) => Add(agent, effect.type, effect.value)

const NUMBER = {
    add: (a, b) => a + b,
    def: () => 0
}

const VECTOR = {
    add: ([x0, y0], [x1, y1]) => [x0 + x1, y0 + y1],
    def: () => [0, 0]
}

const health   = AspectType("health"   , NUMBER)
const position = AspectType("position" , VECTOR)

const damage   = EffectType("damage"   , NUMBER , agent => {})
const drain    = EffectType("drain"    , NUMBER , agent => {})
const velocity = EffectType("velocity" , VECTOR , agent => {})

//

const effects = [ damage, drain, velocity ]

const Turn = (agents) => {
    for (let effect of effects) {
        for (let agent of agents) {
            if ( agent.has(effect) ) {
                effect.func( agent )
                agent.set( effect, effect.type.def() )
            }
        }
    }
}

//

const agent = Agent([
    [health   , 12    ],
    [position , [0, 9]]
])

Apply(agent, Effect(damage, 27))
Apply(agent, Effect(damage, 20))

console.log( agent )
