import Render from "./Render.vue.js"
import indexedDB from "../modules/indexedDB.js"
import saveFile from "../modules/saveFile.js"
import fonts from "../fonts.js"

export default {
    /*html*/
    template: `
    <div>
        <button @click="save"><i class="bi bi-save-fill"></i></button>
        <label class="form-label">Template Name</label>
                 <input v-model="json.name" type="text" class="form-control">
        <select class="form-select" v-model="json.aspectRatio">
            <option v-for="(value, aspectRatio)  in aspectRatios" :value="value">{{aspectRatio}}</option>
        </select>
        <div class="row">
            <div class="col-2">
                <div class="dropdown">
                    <a
                        class="btn btn-secondary dropdown-toggle"
                        href="#"
                        role="button"
                        id="dropdownMenuLink"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Add
                    </a>

                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <li v-for="(name, type) in types" :key="type">
                            <a
                                class="dropdown-item"
                                href="#"
                                @click.prevent="addElement(type)"
                            >
                                {{name}}
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="list-group">
                    <a
                        href="#"
                        class="list-group-item list-group-item-action"
                        v-for="(e, index) in json.elements"
                        :key="index"
                        :class="{active: selected == index}"
                        draggable
                        @dragstart="dragStart($event, index)"
                        @drop="onDrop($event, index)"
                        @dragover.prevent
                        @dragenter.prevent
                        @click.prevent="selected = index"
                    >
                        {{e.name}}
                    </a>
                </div>
            </div>

            <div class="col-7">
                <Render class="border" :json="json" width="100%" :resolution="1080"/>
            </div>

            <div class="col-3">

            <div class="row g-3" v-if="selectedEntity">
                <div class="col-12" v-if="selectedEntity.name != null">
                    <label class="div-label">Name</label>
                    <input v-model="selectedEntity.name" type="text" class="form-control">
                </div>
                
                <div class="col-12" v-if="showInputs.value">
                    <label class="form-label">Value</label>
                    <textarea v-model="selectedEntity.value" class="form-control" rows="3"></textarea>
                </div>
                
                <div class="col-md-6" v-if="selectedEntity.x != null">
                    <label class="form-label">X</label>
                    <input v-model="selectedEntity.x" type="number" step="0.01" class="form-control">
                </div>

                <div class="col-md-6" v-if="selectedEntity.y != null">
                    <label class="form-label">Y</label>
                    <input v-model="selectedEntity.y" type="number" step="0.01" class="form-control">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Width</label>
                    <input v-model="selectedEntity.width" type="number" step="0.01" class="form-control">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Height</label>
                    <input v-model="selectedEntity.height" type="number" step="0.01" class="form-control">
                </div>

                <template v-if="showInputs.text">
                    <div class="col-md-4">
                        <label class="form-label">Font Size</label>
                        <input v-model="selectedEntity.fontSize" type="number" step="0.01" class="form-control">
                    </div>

                    <div class="col-md-4">
                    <label class="form-label">Align</label>
                        <select v-model="selectedEntity.textAlign" class="form-select">
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="center">Center</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                    <label class="form-label"><a href="https://fonts.google.com/" target="_blank">Font</a></label>
                        <select v-model="selectedEntity.font" class="form-select">
                            <option v-for="font in fonts" :value="font.files.regular">{{font.family}}</option>
                        </select>
                    </div>


                    <!--<div class="col-md-4">
                        <select v-model="selectedEntity.textBaseline" class="form-select">
                            <option value="left">One</option>
                            <option value="right">Two</option>
                            <option value="center">Three</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <select v-model="selectedEntity.direction" class="form-select">
                            <option value="left" selected>One</option>
                            <option value="right">Two</option>
                            <option value="center">Three</option>
                        </select>
                    </div>-->
                </template>

                <template v-if="!showInputs.image" >
                    <div class="col-md-6">
                        <label class="form-label">fillStyle</label>
                        <input type="color" v-model="selectedEntity.fillStyle" class="form-control form-control-color">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">strokeStyle</label>
                        <input type="color" v-model="selectedEntity.strokeStyle" class="form-control form-control-color">
                    </div>
                </template>

                <div class="col-md-6">
                <label class="form-label">Alpha</label>
                <input v-model="selectedEntity.alpha" type="number" step="0.01" min="0" max="1" class="form-control">
            </div>

            <div class="col-md-6" >
                <label class="form-label">Angle</label>
                <input v-model="selectedEntity.angle" type="number" step="1" class="form-control">
            </div>
            </div>
    
            </div>
        </div>
    </div>
    `,

    components: { Render },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            selected: null,
            types: {
                IMAGE: "IMAGE",
                TEXT: "TEXT",
                SQUARE: "SQUARE",
                CIRCLE: "CIRCLE",
                RECTANGLE: "RECTANGLE",
                ELLIPSE: "ELLIPSE",
            },
            json: {
                id: null,
                name: "New template",
                aspectRatio: 16 / 9,
                elements: [],
            },
            aspectRatios: {
                "16:9": 16 / 9,
                "1:1": 1,
                "4:3": 4 / 3,
                "3:2": 3 / 2,
                "9:16": 9 / 16,
                "3:4": 3 / 4,
                "2:3": 2 / 3,
                "1.91:1": 1.91 / 1,
            },
            elements: {
                image: {
                    name: "img",
                    image: "",
                },
                text: {
                    text: "",
                },
            },
            fonts: fonts,
        }
    },
    methods: {
        addElement(data) {
            this.json.elements.push({
                type: type,
                name: `${type.toLowerCase()}${
                    this.json.elements.filter((e) => e.type == type).length + 1
                }`,
                x: 0.5,
                y: 0.5,
                width: 1,
                height: 1,
                custom: true,
                ...data,
            })

            this.selected = this.json.elements.length - 1
        },
        deleteElement(index) {
            this.json.elements.splice(index, 1)
        },
        moveElement(from, to) {
            const element = this.json.elements[from]
            this.json.elements.splice(from, 1)
            this.json.elements.splice(to, 0, element)
        },
        save() {
            indexedDB.DB().then((db) => {
                const store = db
                    .transaction("templates", "readwrite")
                    .objectStore("templates")

                let action

                this.json.update = new Date()

                if (!this.json.id) {
                    this.json.id = Math.floor(Math.random() * 99999999)
                    action = store.add(this.json)
                } else {
                    action = store.put(this.json)
                }

                action.onsuccess = (e) => {}
            })
        },
        getTemplate() {
            if (!this.id) return
            indexedDB.DB().then((db) => {
                db
                    .transaction("templates")
                    .objectStore("templates")
                    .get(parseInt(this.id)).onsuccess = (e) => {
                    this.json = { ...this.json, ...e.target.result }
                }
            })
        },
        dragStart(evt, index) {
            evt.dataTransfer.setData("index", index)
        },
        onDrop(evt, index) {
            const oldIndex = evt.dataTransfer.getData("index")
            this.moveElement(oldIndex, index)
        },
        downloadTemplate() {
            saveFile(
                "template.json",
                JSON.stringify(this.json),
                "application/json"
            )
        },
    },
    computed: {
        selectedEntity() {
            if (this.selected == null || !this.json.elements[this.selected])
                return null
            return this.json.elements[this.selected]
        },
        showInputs() {
            return {
                image: this.selectedEntity.type == "IMAGE",
                text: this.selectedEntity.type == "TEXT",
                value: ["TEXT", "IMAGE"].includes(this.selectedEntity.type),
                height: this.selectedEntity.type != "TEXT",
            }
        },
    },
    mounted() {
        this.getTemplate()
    },
}
