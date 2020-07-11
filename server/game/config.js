import { isWalkable } from "../util/util.js"
import { Effect } from "../core/effect.js"
import { Aspect, Number, Vector, Boolean } from "../core/aspect.js"
import { supertype, prototype } from "../core/object.js"

const notSetable = () => {
    console.error("not settable")
    return []
}

/*//////////////////////*/
/*| add health + death |*/
/*//////////////////////*/

export const health = Aspect("hp" , Number, (object, hp, dead) => {
    hp = Math.min(hp, object.maxhp)

    // were out of health, and therefore dead
    if (hp <= 0) dead()

    return hp
})

Effect("damage" , (object, value)  => [[health, value]])

/*////////////////*/
/*| add movement |*/
/*////////////////*/

export const walkable = Aspect("walkable", Boolean, notSetable)
export const size     = Aspect("walkable", Vector , notSetable)

export const position = Aspect("position" , Vector, (object, target) => {
    if ( isWalkable( target ) ) return target

    return object.position
})

Effect("move" , (object, target) => [[position, Vector.sub(target, object.position)]])

let positionable = [ position, walkable, size ]

/*/////////////*/
/*| add magic |*/
/*/////////////*/

export const mana = Aspect("mp" , Number, (object, mp) => Math.min(mp, object.maxmp))

//////////////////

let entity = supertype( ...positionable, health, mana )
let gadget = supertype(  )

let player = prototype(entity, [
    [ walkable , true ],
    [ health   , 100  ],
    [ mana     , 100  ]
])

//

let wall = prototype(gadget, [
    [ health , 200 ]
])

let tree = prototype(gadget, [
    [ health , 50 ]
    [ size   , { x : 1, y: 1 } ]
])