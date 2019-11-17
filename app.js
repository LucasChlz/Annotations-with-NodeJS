// MODULES
const express = require("express")
const handlebars = require("express-handlebars")
const mongoose = require("mongoose")
const app = express();
const bodyParser = require("body-parser")
const path = require("path")

// SETTINGS
    // Body Parser
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/Notebook-NodeJS", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Successfully connected Mongo")
        }).catch((err) => {
            console.log("Erro "+err)
        })
    // STATIC ARCHIVES
        app.use(express.static(path.join(__dirname, "/public")))
    // Handle Bars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');
    // Routes
        app.get('/', (req, res) => {
            res.render("index")
        })

        app.get('/new', (req, res) => {
            res.render("notes/newnotes")
        })

        

    // Connect Server
        const PORT = process.env.PORT || 8020
        app.listen(PORT, () => {
            console.log("Successfully connected server")
        })
