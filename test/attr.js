const AspectType = (name, type) => ({name, type})
const EffectType = (name, apply) => ({name, apply})

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

const health   = Aspect("health"   , NUMBER, () => {})
const mana     = Aspect("mana"     , NUMBER, () => {})
const position = Aspect("position" , VECTOR, () => {})

const damage   = Effect("damage"   , (player, value) => [health, value])
const drain    = Effect("drain"    , (player, value) => [mana, value])
const velocity = Effect("move"     , (player, position) => [])


/////////////
// actions //
/////////////

const _action = {
    id: "id",
    
    range: 1,

    effects: [
        [ damage, 10 ]
    ]
}

const _move = {
    action: "",
    source: "",
    target: ""
}

const isValidTarget = (action, source, target) => {
    return true
}

const applyAction = (move, changes) => {
    let action = getAction( move.action )
    let player = getPlayer( move.source )
    let target = getPlayer( move.target )

    if ( !isValidTarget(action, player, target) ) 

    for (let effect of action.effects) applyEffect(target, effect, changes)
}

const applyEffect = (target, [effect, value], changes) => {
    effect.apply(target, value).forEach(change => applyChange(target, change, changes))
}

const applyChange = (target, [aspect, value], changes) => {
    if ( !changes.has(target) ) changes.set(target, new Map())

    let change = changes.get( target )

    change.set(aspect.name, aspect.type.add( value, 
        change.has(aspect.name) ? change.get(aspect.name) : aspect.type.def()
    ) )
}

//

const applyActions = actions => {
    let changes = new Map()

    for (let action of actions) applyAction(action, changes)
}