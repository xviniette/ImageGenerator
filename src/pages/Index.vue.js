import Customize from "../components/Customize.vue.js"
import indexedDB from "../modules/indexedDB.js"
import Render from "../components/Render.vue.js"
import saveFile from "../modules/saveFile.js"

export default {
    /*html*/
    template: `
    <div>
        <nav class="navbar navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand">IMAGE GENERATOR by <a href="https://twitter.com/xviniette" target="_blank">Vincent Bazia</a></a>
                    <button class="btn btn-outline-primary" type="submit" @click="newTemplate">New template</button>
            </div>
        </nav>

        <div class="container">

            <div v-if="template">
                <Customize :template="template"/>
            </div>

            <div class="row g-3">
                <div class="col-3" v-for="template in sortedTemplates" :key="template.id">
                    <div class="card shadow">
                    <div class="card-img-top"  @click.prevent="selectTemplate(template)" >
                        <Render :json="template" :resolution="400"  />
                        </div>
                        <div class="card-body">
                            <h5 class="card-title"  @click.prevent="selectTemplate(template)">{{template.name}}</h5>
                            <div class="dropdown">
                                <span id="dropdownMenuspan1" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </span>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><router-link :to="{path:'editor/'+template.id}" class="dropdown-item">Edit</router-link></li>
                                    <li><a @click.prevent="newTemplate(template)" class="dropdown-item" href="#">Copy</a></li>
                                    <li><a @click.prevent="downloadTemplate(template)"  class="dropdown-item" href="#">Downloa</a></li>
                                    <li><a @click.prevent="removeTemplate(template)"  class="dropdown-item text-danger" href="#">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    components: { Customize, Render },
    data() {
        return {
            template: null,
            templates: [],
        }
    },
    methods: {
        selectTemplate(template) {
            if (!template) return
            this.template = template
        },
        getTemplates() {
            indexedDB.DB().then((db) => {
                db
                    .transaction("templates")
                    .objectStore("templates")
                    .getAll().onsuccess = (e) => {
                    this.templates = e.target.result
                    if (!this.template) this.selectTemplate(this.templates[0])
                }
            })
        },
        removeTemplate(template) {
            indexedDB.DB().then((db) => {
                db
                    .transaction("templates", "readwrite")
                    .objectStore("templates")
                    .delete(template.id).onsuccess = (e) => {
                    this.templates = this.templates.filter(
                        (t) => t.id != template.id
                    )
                }
            })
        },
        newTemplate(defaultTemplate = {}) {
            const template = {
                name: "New template",
                ...defaultTemplate,
                id: Math.floor(Math.random() * 99999999),
                update: Date.now(),
            }

            indexedDB.DB().then((db) => {
                db
                    .transaction("templates", "readwrite")
                    .objectStore("templates")
                    .add(template).onsuccess = (e) => {
                    this.getTemplates()
                }
            })
        },
        downloadTemplate(template) {
            saveFile({
                name: `${template.name}.json`,
                value: JSON.stringify(template),
                type: "application/json",
            })
        },
    },
    computed: {
        sortedTemplates() {
            return [...this.templates].sort((a, b) =>
                a.update > b.update ? 1 : -1
            )
        },
    },
    mounted() {
        this.getTemplates()
    },
}
