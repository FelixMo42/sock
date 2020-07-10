import { isWalkable } from "./util.js"
import { Effect } from "./core/effect.js"
import { Aspect, Number, Vector, Boolean } from "./core/aspect.js"

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

export const position = Aspect("position" , Vector, (object, target) => {
    if ( isWalkable( target ) ) return target

    return object.position
})

Effect("move" , (object, target) => [[position, Vector.sub(target, object.position)]])

/*/////////////*/
/*| add magic |*/
/*/////////////*/

export const mana = Aspect("mp" , Number, (object, mp) => Math.min(mp, object.maxmp))