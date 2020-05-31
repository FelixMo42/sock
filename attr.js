const AspectType = (name, type) => ({name, type})
const EffectType = (name, type) => ({name, type})

const Aspect = (type, value) => ([type, value])
const Effect = (type, value) => ({type, value})

const Get = (agent, effect) => agent.has(effect) ? agent.get(effect) : effect.type.def()

const Agent = aspects => new Map(aspects)
const Apply = (agent, effect) =>
    agent.set(
        effect.type,
        effect.type.type.add(
            Get( agent, effect.type ),
            effect.value
        )
    )

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

const damage   = EffectType("damage"   , NUMBER)
const drain    = EffectType("drain"    , NUMBER)
const velocity = EffectType("velocity" , VECTOR)

const agent = Agent([
    Aspect(health   , 12    ),
    Aspect(position , [0, 9])
])

Apply(agent, Effect(damage, 27))
Apply(agent, Effect(damage, 20))

console.log( agent )
