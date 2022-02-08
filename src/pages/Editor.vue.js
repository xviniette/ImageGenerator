import Editor from "../components/Editor.vue.js"

export default {
    /*html*/
    template: `<Editor :id="this.$route.params.id"/>`,
    components: { Editor },
}
