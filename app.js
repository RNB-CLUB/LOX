const express = require("express")
const app = express()
let posts = []

app.use(express.static("static"))
app.use(express.json())


app.post("/add", (req, res) => {
    let data = req.body
    posts.push(data)
    console.log(data)
    res.status(200)
    res.send()
})


app.get("/posts", (req, res) => {
    res.status(200)
    res.setHeader("content-type", "application/json")
    res.json(posts)
})

app.listen(3000, () => console.log("Server start"))