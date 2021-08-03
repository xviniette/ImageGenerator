import { flat } from "./flat"

export default (a, b) => {
    a = flat(a)
    b = flat(b)

    const diffs = {}

    for (let attr in b) {
        if (a[attr] == undefined || a[attr] != b[attr]) diffs[attr] = b[attr]
    }

    return diffs
}
