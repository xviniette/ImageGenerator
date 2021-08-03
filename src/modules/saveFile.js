export default ({ data, name, value = "", type = "text/plain" }) => {
    const element = document.createElement("a")
    element.setAttribute(
        "href",
        data ? data : `data:${type};charset=utf-8,${encodeURIComponent(value)}`
    )
    element.setAttribute("download", name)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
