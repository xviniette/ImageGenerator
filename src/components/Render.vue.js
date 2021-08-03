import Renderer from "../modules/Renderer.js"

export default {
    /*html*/
    template: `<canvas ref="canvas" style="width:100%"></canvas>`,
    props: { json: Object, resolution: Number },
    data() {
        return {
            canvas: null,
            timeout: null,
            loadedFonts: {},
            loadedAssets: {},
        }
    },
    watch: {
        json: {
            async handler(value) {
                clearTimeout(this.timeout)
                this.timeout = setTimeout(() => {
                    this.draw()
                }, 200)
            },
            deep: true,
        },
    },
    methods: {
        async draw() {
            const data = { ...this.json }
            if (this.resolution) data.resolution = this.resolution

            await Renderer(
                this.$refs.canvas,
                data,
                this.loadedAssets,
                this.loadedFonts
            )
            await Renderer(this.$refs.canvas, data)
            this.$emit("base64", this.$refs.canvas.toDataURL())
        },
    },
    mounted() {
        this.draw()
    },
}
