const roundRect = (ctx, x, y, width, height, radius = 0) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
}

const generateString = (length) => {
    const characters = "abcdefghijklmnopqrstuvwxyz"
    let result = ""
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

const loadFonts = async (json, loadedFonts = {}) => {
    if (!json.elements) return []
    return await Promise.all(
        json.elements
            .filter((e) => e.font != null)
            .map((e) => {
                return new Promise((resolve, reject) => {
                    if (loadedFonts[e.font]) {
                        return resolve({
                            font: e.font,
                            id: loadedFonts[e.font],
                        })
                    }

                    const id = generateString(5)
                    const font = new FontFace(id, `url(${e.font})`)
                    font.load()
                        .then(() => {
                            document.fonts.add(font)
                        })
                        .finally(() => {
                            loadedFonts[e.font] = id
                            resolve({ font: e.font, id: id })
                        })
                })
            })
    )
}

const loadAssets = async (json, loadedAssets = {}) => {
    if (!json.elements) return []
    return await Promise.all(
        json.elements
            .filter((e) => e.type == "IMAGE" && e.value != undefined)
            .map((e) => {
                return new Promise((resolve, reject) => {
                    if (loadedAssets[e.value]) {
                        resolve({
                            name: e.value,
                            image: loadedAssets[e.value],
                        })
                    } else {
                        let img = new Image()
                        img.crossOrigin = ""
                        img.onload = () => {
                            loadedAssets[e.value] = img
                            resolve({
                                name: e.value,
                                image: img,
                            })
                        }

                        img.onerror = () => {
                            resolve(null)
                        }

                        img.src = e.value
                    }
                })
            })
    )
}

const render = async (canvas, json, loadedAssets = {}, loadedFonts = {}) => {
    json = JSON.parse(JSON.stringify(json))
    const ctx = canvas.getContext("2d")

    const aspectRatio = json.aspectRatio || 16 / 9
    const resolution = json.resolution || 1080

    canvas.width = Math.round(resolution * aspectRatio)
    canvas.height = resolution

    if (!json.elements) return

    const fonts = await loadFonts(json, loadedAssets)
    const assets = (await loadAssets(json, loadedFonts)).filter(
        (a) => a != null
    )

    json.elements.forEach((e) => {
        e.x *= canvas.width
        e.y *= canvas.height

        e.width *= canvas.width
        e.height *= canvas.height

        //Colors
        ctx.fillStyle = e.fillStyle || "#000"
        ctx.strokeStyle = e.strokeStyle || "#000"

        //Line style
        ctx.lineWidth = e.lineWidth || 0
        ctx.lineCap = e.lineCap || "butt"
        ctx.lineJoin = e.lineJoin || "miter"
        ctx.miterLimit = e.miterLimit || 10
        ctx.lineDashOffset = e.lineDashOffset || 0

        //Shadows
        ctx.shadowOffsetX = e.shadowX || 0
        ctx.shadowOffsetY = e.shadowY || 0
        ctx.shadowBlur = e.shadowBlur || 0
        ctx.shadowColor = e.shadowColor || "#000"

        //Text
        ctx.textAlign = e.textAlign || "left"
        ctx.textBaseline = e.textBaseline || "middle"
        ctx.direction = e.direction || "inherit"

        let fontSize = e.fontSize || 0.1
        fontSize *= canvas.height
        const fontId = fonts.find((f) => f.font == e.font)
        ctx.font = `${fontSize}px ${fontId?.id || "serif"}`

        //alpha
        ctx.globalAlpha = e.alpha == undefined ? 1 : e.alpha

        ctx.save()
        ctx.translate(e.x || 0, e.y || 0)
        let angle = e.angle || 0
        ctx.rotate((angle * Math.PI) / 180)

        let anchorX = e.anchorX || 0.5
        let anchorY = e.anchorY || 0.5

        if (e.clip) {
            ctx.save()
            ctx.beginPath()
            ctx.ellipse(0, 0, e.width / 2, e.height / 2, 0, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.clip()
        }

        switch (e.type) {
            case "IMAGE":
                if (assets.find((a) => a.name == e.value)) {
                    const image = assets.find((a) => a.name == e.value).image

                    let width = 0
                    let height = 0

                    let crop = {}

                    switch (e.fit) {
                        case "fill":
                            width = e.width
                            height = e.height
                            break
                        case "original":
                            width = image.width
                            height = image.height
                            break
                        case "fit":
                        default:
                            width = e.width
                            height = e.height

                            const sourceRatio = image.width / image.height
                            const imageRatio = width / height

                            let imageWidth = image.width
                            let imageHeight = image.height

                            if (sourceRatio < imageRatio) {
                                imageHeight = imageWidth / imageRatio
                            } else {
                                imageWidth = imageHeight * imageRatio
                            }

                            crop = {
                                x: {
                                    start: (image.width - imageWidth) / 2,
                                    width: imageWidth,
                                },
                                y: {
                                    start:
                                        Math.abs(imageHeight - image.height) /
                                        2,
                                    height: imageHeight,
                                },
                            }
                    }

                    ctx.drawImage(
                        image,
                        crop.x.start,
                        crop.y.start,
                        crop.x.width,
                        crop.y.height,
                        -width * anchorX,
                        -height * anchorY,
                        width,
                        height
                    )
                }
                break
            case "TEXT":
                e.value?.split("\n").forEach((text, index) => {
                    if (e.fillStyle) {
                        ctx.fillText(text, 0, 0 + index * fontSize)
                    }

                    if (e.strokeStyle)
                        ctx.strokeText(text, 0, 0 + index * e.fontSize)
                })
                break
            case "RECT":
                if (e.corner) {
                    roundRect(
                        ctx,
                        -e.width * anchorX,
                        -e.height * anchorY,
                        e.width,
                        e.height,
                        e.corner
                    )
                } else {
                    ctx.fillRect(
                        -e.width * anchorX,
                        -e.height * anchorY,
                        e.width,
                        e.height
                    )
                }

                break
            case "SQUARE":
                if (e.corner) {
                    roundRect(
                        ctx,
                        -e.width * anchorX,
                        -e.width * anchorY,
                        e.width,
                        e.width,
                        e.corner
                    )
                } else {
                    ctx.fillRect(
                        -e.width * anchorX,
                        -e.width * anchorY,
                        e.width,
                        e.width
                    )
                }

                break
            case "CIRCLE":
                ctx.beginPath()
                ctx.ellipse(0, 0, e.width / 2, e.width / 2, 0, 0, 2 * Math.PI)
                ctx.closePath()
                ctx.stroke()
                ctx.fill()
                break
            case "ELLIPSE":
                ctx.beginPath()
                ctx.ellipse(0, 0, e.width / 2, e.height / 2, 0, 0, 2 * Math.PI)
                ctx.closePath()
                ctx.stroke()
                ctx.fill()
                break
        }

        if (e.clip) {
            switch (e.clip) {
                case "ELLIPSE":
                    ctx.beginPath()
                    ctx.ellipse(
                        0,
                        0,
                        e.width / 2,
                        e.height / 2,
                        0,
                        0,
                        2 * Math.PI
                    )
                    ctx.clip()
                    ctx.closePath()
                    ctx.restore()
                    break
            }
        }

        ctx.restore()
    })
}

export default render
