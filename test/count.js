import fs from "fs"

console.log("")

const getLineCount = (path, base="") => {
    if ( fs.statSync(path).isDirectory() ) {
        let total = 0
        for (let name of fs.readdirSync(path)) {
            total += getLineCount(path + "/" + name, base + "\t")
        }
        console.log(base, total, "\t", path.split("/").pop() + "/")
        return total
    } else {
        let lineCount = fs.readFileSync(path).toString().split("\n").length 
        console.log(base, lineCount, "\t", path.split("/").pop())
        return lineCount
    }
}

let total =
    getLineCount("client") +
    getLineCount("server") + 
    getLineCount(".actions.json") +
    0

console.log("\ntotal: ", total, "\n")