import { isEmptyPosition } from "./util.js"
import { Effect } from "./core/effect.js"
import { Aspect, Number, Vector } from "./core/aspect.js"

/*//////////////////////*/
/*| add health + death |*/
/*///////////////////////*/

const health = Aspect("hp" , Number, (object, hp, dead) => {
    hp = Math.min(hp, object.maxhp)

    // were out of health, and therefore dead
    if (hp <= 0) dead()

    return hp
})

Effect("damage" , (object, value)  => [[health, value]])

/*////////////////*/
/*| add movement |*/
/*////////////////*/

const position = Aspect("position" , Vector, (object, target) => {
    if ( isEmptyPosition( target ) ) return target

    return object.position
})

Effect("move"   , (object, target) => [[position, Vector.sub(target, object.position)]])

/*/////////////*/
/*| add magic |*/
/*/////////////*/

const mana = Aspect("mp" , Number, (object, mp) => Math.min(mp, object.maxmp))