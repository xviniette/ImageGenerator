import Index from "./pages/Index.vue.js"
import Editor from "./pages/Editor.vue.js"

export default new VueRouter({
    routes: [
        {
            path: "/",
            name: "index",
            component: Index,
        },
        {
            path: "/editor/:id",
            name: "editor",
            component: Editor,
        },
        {
            path: "*",
            redirect: "/",
        },
    ],
})
