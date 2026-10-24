const express = require("express")
const multer = require("multer")
const path = require("path")
const db = require("./db")
const app = express()

db.execute("show tables", (err, res) => console.log(res))

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

app.get("/", (req, res) => {
    db.query("SELECT * FROM posts", (err, result) => {
        if (err) {
            console.log(err.message)
            return res.render("index", { posts: [] })
        }
        result.forEach(post => {
            post.image = post.image && post.image !== "" ? JSON.parse(post.image) : []
        })
        res.render("index", { posts: result })
    })
})

app.post("/add", upload.fields([{ name: "image" }]), (req, res) => {
    let data = req.body
    let images = []
    
    if (req.files && req.files.image) {
        images = req.files.image.map(file => file.filename)
    }
    data.image = JSON.stringify(images)
    
    db.query("INSERT INTO posts SET ?", data, (err) => {
        if (err) {
            console.log(err.message)
            return res.status(500).send("Database Error")
        }
        return res.status(201).send()
    })
})

app.get("/post/:id", (req, res) => {
    const postId = Number(req.params.id)
    
    db.query("SELECT * FROM posts WHERE id = ?", [postId], (err, postResult) => {
        if (err || postResult.length === 0) {
            res.status(404)
            return res.render("notfound")
        }
        
        let post = postResult[0]
        post.image = post.image && post.image !== "" ? JSON.parse(post.image) : []

        db.query("SELECT * FROM comments WHERE post_id = ?", [postId], (err, commentsResult) => {
            let comments = err ? [] : commentsResult
            res.render("post", { post, comments })
        })
    })
})

app.post("/comment", (req, res) => {
    db.query("INSERT INTO comments SET ?", req.body, (err) => {
        if (err) console.log(err.message)
        res.status(201).end()
    })
})

app.use((req, res, next) => {
    res.status(404)
    res.render("notfound")
})

app.listen(3000, () => console.log("Server start"))