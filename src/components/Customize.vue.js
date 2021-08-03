import Render from "./Render.vue.js"
import saveFile from "../modules/saveFile.js"

export default {
    /*html*/
    template: `
    <div class="row">
        <div class="col-9">
            <Render :json="json" @base64="value => this.base64 = value"/>
        </div>
        <div class="col-3">
            <div v-for="input in inputs" class="mb-3">
                <label class="form-label">{{input.name}}</label>
                <textarea class="form-control" v-model="input.value" rows="2"></textarea>
            </div>
            <button type="button" class="btn btn-primary" @click="download">Télécharger</button>
        </div>
  </div>
    `,
    props: {
        template: Object,
    },
    components: { Render },
    data() {
        return {
            json: null,
            base64: null,
        }
    },
    methods: {
        setInputs() {
            this.json = JSON.parse(JSON.stringify(this.template))
        },
        download() {
            saveFile({
                name: `image.png`,
                data: this.base64,
            })
        },
    },
    watch: {
        template() {
            this.setInputs()
        },
    },
    computed: {
        inputs() {
            return this.json?.elements?.filter(
                (e) => (e.type == "IMAGE" || e.type == "TEXT") && e.custom
            )
        },
    },
    mounted() {
        this.setInputs()
    },
}
