
const PI = Math.PI

export const range = (min, max) => () => Math.random() * (max - min) + min
export const randomAngle = range(0, 2 * PI)

const defaultTreeSize = range(40, 100)

export const rotation = (x, y, angle) => (w, h) => [
    x + w * Math.cos(angle) - h * Math.sin(angle),
    y + w * Math.sin(angle) + h * Math.cos(angle)
]

export function interpolate(p, n1, n2) {
    return n1 + (n2 - n1) * p
}

export function drawLeafArc(map, x, y, r, size, start=0, angle=2 * PI) {
    map.moveTo(
        x + Math.cos(start) * r,
        y + Math.sin(start) * r
    )

    let step = size / r
    let half = step / 2

    for (let a = start + step; a < start + angle + step; a += step) {
        map.bezierCurveTo(
            x + Math.cos(a - half - Math.random() * half) * (r + 10 + 10 * Math.random()),
            y + Math.sin(a - half - Math.random() * half) * (r + 10 + 10 * Math.random()),

            x + Math.cos(a - half + Math.random() * half) * (r + 10 + 10 * Math.random()),
            y + Math.sin(a - half + Math.random() * half) * (r + 10 + 10 * Math.random()),

            x + Math.cos(a) * r,
            y + Math.sin(a) * r
        )
    }
}

export function drawTree(map, x, y, radius=defaultTreeSize()) {
    let leafsize = 30

    map.beginFill(0x276A58)
    drawLeafArc(map, x, y, radius, leafsize, randomAngle())
    map.endFill()

    let stepsize = range(15, 20)

    for (let r = radius - stepsize(); r > 0; r -= stepsize() ) {
        drawLeafArc(map, x, y, r, leafsize, randomAngle(), randomAngle())
    }
}

export function drawBrick(map, x, y, angle, length, width, color=0xA3AC99) {
    let rot = rotation(x, y, angle)

    map.beginFill(color)
    map.moveTo( ...rot(0,      width / 2) )
    map.lineTo( ...rot(length, width / 2) )
    map.lineTo( ...rot(length, -width / 2) )
    map.lineTo( ...rot(0,      -width / 2) )
    map.lineTo( ...rot(0,      width / 2) )
    map.endFill()

}

export function drawWall(map, x1, y1, x2, y2) {
    let width = range(10, 14)
    let length = range(30, 50)

    let walllength = Math.sqrt( (x2 - x1) ** 2 + (y2 - y1) ** 2 )

    let angle = Math.atan2(y2 - y1, x2 - x1)

    let p = 0
    while (p < walllength) {
        let l = length()

        if (p + l > walllength) {
            l = walllength - p
        }

        drawBrick( map,
            interpolate(p / walllength, x1, x2),
            interpolate(p / walllength, y1, y2),
            angle, l, width()
        )

        p += l
    }
}

export function drawTile(map, x1, y1, x2, y2) {
    let tilesize = 60

    map.beginFill(0xC1CCBC)
    map.drawRect(x1, y1, x2 - x1, y2 - y1)
    map.endFill()

    map.lineStyle(2, 0x000000, 1.0)
    for (let x = x1; x < x2; x += tilesize) {
        map.moveTo(y1, x)
        map.lineTo(y2, x)
    }
    for (let y = y1; y < y2; y += tilesize) {
        map.moveTo(y, x1)
        map.lineTo(y, x2)
    }
    map.lineStyle(3, 0x000000, 1.0)
}

export function drawDoor(map, x, y, angle) {
    drawBrick(map, x, y, angle, 60, 8, 0x855E42)
}

export function drawGround(map, x, y) {
    
}

// some model images:
// https://i.imgur.com/psz9k4b.jpg
// https://66.media.tumblr.com/4f6da4eff95ea505e9587092def0109b/677bae12f0710519-df/s2048x3072/b6fb01e4707249886fbe9ab55f36c96296484d9e.jpg
// https://i.redd.it/y4zh9zp7vx031.jpg