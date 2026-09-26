const express = require("express")
const multer = require("multer")
const path = require("path")
const app = express()

app.use(express.static("static"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.set("views", "views")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

app.use("/uploads", express.static("uploads"))

let posts = []

app.get("/", (req, res) => {
    res.render("index", { posts })
})

app.post("/add", upload.fields([{ name: "image" }]), (req, res) => {
    let data = req.body
    if (req.files.image) data.image = req.files.image.map(file => file.filename)
    data.id = posts.length
    posts.push({...data})
    res.status(201)
    res.send()
})

app.get("/posts", (req, res) => {
    res.json(posts)
})

app.get("/post/:id", (req, res) => {
    const postId = Number(req.params.id)
    const post = posts.find(p => p.id === postId)
    if (!post) {
        return res.status(404).render("notfound")
    }
    res.render("post", { post })
})

app.use((req, res, next) => {
    res.status(404)
    res.render("notfound")
})

app.listen(3000, () => console.log("Server start"))