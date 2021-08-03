const unflat = (flatObject) => {
    const object = {}

    Object.keys(flatObject).forEach((key) => {
        const splitKey = key.split(".")

        let cObject = object

        splitKey.forEach((attribute, index) => {
            if (index == splitKey.length - 1) {
                return (cObject[attribute] = flatObject[key])
            }

            if (!cObject[attribute]) cObject[attribute] = {}
            cObject = cObject[attribute]
        })
    })

    return object
}

const flat = (unflatObject, path) => {
    const flat = {}

    Object.keys(unflatObject).forEach((key) => {
        if (typeof unflatObject[key] != "object") return
        return flat(unflatObject[key], `${path}.${key}`)
    })

    return flat
}

export default { unflat, flat }
