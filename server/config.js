import { isEmptyPosition } from "./util.js"
import { Effect } from "./core/effect.js"
import { Aspect, Number, Vector } from "./core/aspect.js"

/*///////////////*/
/*| add aspects |*/
/*///////////////*/

const health = Aspect("hp" , Number, (player, hp) => {
    hp = Math.min(hp, player.maxhp)

    // were out of health, and therefore dead
    // if (hp <= 0) removePlayer(player)

    return hp
})

const mana = Aspect("mp" , Number, (player, mp) => Math.min(mp, player.maxmp))

const position = Aspect("position" , Vector, (player, target) => {
    if ( isEmptyPosition( target ) ) return target

    return player.position
})

/*///////////////*/
/*| add effects |*/
/*///////////////*/

Effect("damage" , (player, value)  => [[health, value]])
Effect("move"   , (player, target) => [[position, Vector.sub(target, player.position)]])