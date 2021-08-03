import config from "../config.js"

export default {
    db: null,
    DB() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve(this.db)

            const request = window.indexedDB.open(
                config.indexDB.name,
                config.indexDB.version
            )

            request.onerror = (event) => {
                reject()
            }

            request.onsuccess = (event) => {
                this.db = event.target.result
                resolve(this.db)
            }

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                db.createObjectStore("templates", { keyPath: "id" })
            }
        })
    },
}
