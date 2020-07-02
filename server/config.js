import { isEmptyPosition } from "./util.js"
import { Effect } from "./core/effect.js"
import { Aspect, Number, Vector } from "./core/aspect.js"
import { removePlayer } from "./core/player.js"

/*//////////////////////*/
/*| add health + death |*/
/*///////////////////////*/

const health = Aspect("hp" , Number, (player, hp, dead) => {
    hp = Math.min(hp, player.maxhp)

    // were out of health, and therefore dead
    if (hp <= 0) dead()

    return hp
})

Effect("damage" , (player, value)  => [[health, value]])

/*////////////////*/
/*| add movement |*/
/*////////////////*/

const position = Aspect("position" , Vector, (player, target) => {
    if ( isEmptyPosition( target ) ) return target

    return player.position
})

Effect("move"   , (player, target) => [[position, Vector.sub(target, player.position)]])

/*/////////////*/
/*| add magic |*/
/*/////////////*/

const mana = Aspect("mp" , Number, (player, mp) => Math.min(mp, player.maxmp))