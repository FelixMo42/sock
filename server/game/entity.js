import { isWalkable } from "../util/util.js"
import { Effect } from "../core/effect.js"
import { Aspect, Number, Vector, Boolean } from "../core/aspect.js"
import { supertype, prototype } from "../core/object.js"

const notSetable = () => {
    console.error("not settable")
    return []
}

/*//////////*/
/*| add hp |*/
/*//////////*/

export const maxhp = Aspect("maxhp", Number)
export const hp    = Aspect("hp"   , Number, (object, hp, dead) => {
    hp = Math.min(hp, object.maxhp)

    // were out of hp, and therefore dead
    if (hp <= 0) dead()

    return hp
})

const setDefaultHp = def => [[hp, def], [maxhp, def]]

Effect("damage" , (object, value)  => [[hp, value]])

/*//////////*/
/*| add mp |*/
/*//////////*/

export const maxmp = Aspect("maxmp" , Number)
export const mp    = Aspect("mp"    , Number, (object, mp) => Math.min(mp, object.maxmp))

const setDefaultMp = def => [[mp, def], [maxmp, def]]

/*////////////////*/
/*| add movement |*/
/*////////////////*/

export const walkable = Aspect("walkable", Boolean, notSetable)
export const size     = Aspect("size"    , Vector , notSetable)

export const position = Aspect("position" , Vector, (object, target) => {
    if ( isWalkable( target ) ) return target

    return object.position
})

Effect("move" , (object, target) => [[position, Vector.sub(target, object.position)]])

//////////////////

export const entity = supertype(
    position, walkable, size,
    hp, maxhp,
    mp, maxmp
)

export const player = prototype(entity,
    [ walkable , false ], [ size , { x: 1, y: 1 } ],
    ...setDefaultHp( 100 ),
    ...setDefaultMp( 100 )
)

export const wall = prototype(entity,
    [ walkable , false ],
    ...setDefaultHp( 500 ),
    ...setDefaultMp( 0 )
)

export const tree = prototype(entity,
    [ walkable , false ], [ size , { x: 1, y: 1 } ],
    ...setDefaultHp( 50 ),
    ...setDefaultMp( 0 )
)