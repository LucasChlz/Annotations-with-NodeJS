// MODULES
const express = require("express")
const handlebars = require("express-handlebars")
const mongoose = require("mongoose")
const app = express();
const session = require("express-session")
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const path = require("path")
require("./models/Note")
const Note = mongoose.model("notes")

// SETTINGS
    // Session
        app.use(session({
            secret: "password",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
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
    // Global Var
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
    // Routes
        app.get('/', (req, res) => {
            res.render("index")
        })

        app.get("/list", (req, res) => {
            Note.find().sort({date: "desc"}).then((notes) => {
                 res.render("notes/listnote", {notes: notes})
             }).catch((err) => {
                 req.flash("error_msg", "Error")
             })
         })

        app.get('/new', (req, res) => {
            res.render("notes/newnotes")
        })

        app.post("/note/new", (req, res) => {
            var err = [];

            if(!req.body.title || typeof req.body.title == undefined || req.body.title == null){
                err.push({txt: "Enter a title"})
            }
            if(!req.body.content || typeof req.body.content == undefined || req.body.content == null){
                err.push({txt: "Enter a content"})
            }

            if(err.length > 0){
                res.render("notes/newnotes", {err: err})
            }else{
                const NewNote = {
                    title: req.body.title,
                    content: req.body.content,
                    description: req.body.description,
                    slug: req.body.slug
                }
                new Note(NewNote).save().then(() => {
                    req.flash("success_msg", "Successfully created note")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "Error saving note")
                    res.redirect("/")
                })
            }
        })

        app.get("/note/view/edit:id", (req, res) => {
            Note.findOne({_id: req.params.id}).then((notes) => {
                res.render("notes/editnotes", {notes: notes})
            }).catch((err) => {
                req.flash("error_msg", "This note no longer exists")
                res.redirect("/list")
            })
        })

        app.post("/note/view/edit", (req, res) => {

            Note.findOne({_id: req.body.id}).then((notes) => {
                
                notes.title = req.body.title,
                notes.description = req.body.description,
                notes.content = req.body.content

                notes.save().then(() => {
                    req.flash("success_msg", "Successfully edited note")
                    res.redirect("/list")
                }).catch((err) => {
                    req.flash("error_msg", "Error editing note")
                    res.redirect("/list")
                })
            }).catch((err) => {
                req.flash("error_msg", "Error editing note")
                res.redirect("/list")
            })

        })

        app.post("/list/delete", (req, res) => {
            Note.deleteOne({_id: req.body.id}).then(() => {
                req.flash("success_msg", "Note deleted successfully")
                res.redirect("/list")
            }).catch((err) => {
                req.flash("error_msg", "Error deleting note")
                res.redirect("/list")
            })
        })

        app.get("/note/view/:slug", (req, res) => {
            Note.findOne({slug: req.params.slug}).then((notes) => {
                if(notes){
                    res.render("notes/view", {notes: notes})
                }else{
                    req.flash("error_msg", "This note does not exist")
                    res.redirect("/list")
                }
            }).catch((err) => {
                req.flash("error_msg", "Error")
                res.redirect("/")
            })
        })


    // Connect Server
        const PORT = process.env.PORT || 8020
        app.listen(PORT, () => {
            console.log("Successfully connected server")
        })
