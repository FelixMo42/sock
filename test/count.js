import fs from "fs"

console.log("")

const getLineCount = (path, base="") => {
    if ( fs.statSync(path).isDirectory() ) {
        let total = 0
        for (let name of fs.readdirSync(path)) {
            total += getLineCount(path + "/" + name, base + "\t")
        }
        console.log(base, total, "\t", path)
        return total
    } else {
        let lineCount = fs.readFileSync(path).toString().split("\n").length 
        console.log(base, lineCount, "\t", path)
        return lineCount
    }
}

let total =
    getLineCount("client") +
    getLineCount("server")

console.log("\ntotal: ", total, "\n")