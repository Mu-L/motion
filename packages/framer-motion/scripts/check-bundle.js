const path = require("path")
const { existsSync, readFileSync } = require("fs")
const pkg = require("../package.json")

const dist = path.join(__dirname, "..", "dist")

const file = readFileSync(path.join(dist, "dom.d.ts"), "utf8")

if (file.includes(`<reference types="react" />`)) {
    throw new Error("DOM bundle includes reference to React")
}

/**
 * Verify every "types" entry in package.json exports points to a file that
 * exists, and that the bundled .d.ts file is self-contained (no relative
 * imports of internal chunks). Issue #2900.
 */
for (const [name, entry] of Object.entries(pkg.exports)) {
    if (!entry || typeof entry !== "object" || !entry.types) continue

    const typesPath = path.join(__dirname, "..", entry.types)
    if (!existsSync(typesPath)) {
        throw new Error(
            `Types file for "${name}" (${entry.types}) does not exist`
        )
    }

    const contents = readFileSync(typesPath, "utf8")
    const relativeImport = contents.match(/from ['"](\.[^'"]+)['"]/)
    if (relativeImport) {
        throw new Error(
            `Types file for "${name}" (${entry.types}) contains a relative import (${relativeImport[1]}) — types must be bundled into a single self-contained file`
        )
    }
}
