// ******************************************* BOOKS RELATED ENDPOINTS ***********************************

/* ********************************************** BOOKS CRUD ENDPOINTS ***********************************

1. CREATE --> POST http://localhost:3001/books/ (+body)
2. READ --> GET http://localhost:3001/books/ (+ optional query params)
3. READ (single book) --> GET http://localhost:3001/books/:bookId
4. UPDATE (single book) --> PUT http://localhost:3001/books/:bookId (+ body)
5. DELETE (single book) --> DELETE http://localhost:3001/books/:bookId

*/


import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import fs from "fs"
import httpErrors from "http-errors"
import { checksPostsSchema, triggerBadRequest } from "./validator.js"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import { getPDFReadableStream } from "../../pdf-tools.js"


const { NotFound, Unauthorized, BadRequest } = httpErrors
const { readJSON, writeJSON, writeFile, createReadStream } = fs

const postsRouter = express.Router()

const postsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "posts.json")

const anotherStupidMiddleware = (req, res, next) => {
  console.log("I am a stupid middleware")
  next()
}

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath))
const writePosts = postsArray => fs.writeFileSync(postsJSONPath, JSON.stringify(postsArray))



// DOWNLOAD PDF FILE

postsRouter.get("/pdf", (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=ThatsSomeArticle.pdf")

  const source = getPDFReadableStream([
    {
      "category": 1,
      "title": "yes",
      "cover": "https://media.timeout.com/images/105733042/750/422/image.jpg",
      "readTime": { "value": 2, "unit": "minute" },
      "author": {
        "name": "Daniel Rudolph Earpz",
        "avatar": "https://img.pixers.pics/pho_wat(s3:700/FO/44/93/03/31/700_FO44930331_485272939904df977ef92a30c555c7a4.jpg,700,700,cms:2018/10/5bd1b6b8d04b8_220x50-watermark.png,over,480,650,jpg)/kropspude-rudolph-rensdyr-rod-nase-og-hat.jpg.jpg"
      },
      "content": "HTML",
      "createdAt": "2022-12-21T15:08:36.228Z",
      "id": "1hv47u229ulbxsi8zo",
      "updatedAt": "2022-12-22T13:47:50.129Z",
      "comments": ["Yes very goood stuff", "Insane dog"]
    },
    {
      "category": "Horrible Stuff",
      "title": "Dildo delivery stalls highway traffic",
      "cover": "https://asset.dr.dk/imagescaler01/https%3A%2F%2Fwww.dr.dk%2Fimages%2Fother%2F2014%2F12%2F03%2Ffe96ca27-9bc1-4b66-a76c-3e45d6c75582_ssp_vinge_motorvej.jpg&w=620",
      "readTime": { "value": 2, "unit": "minute" },
      "author": {
        "name": "Doctor. Rock Johnson",
        "avatar": "https://upload.wikimedia.org/wikipedia/commons/6/68/Dwayne_Johnson_at_the_2009_Tribeca_Film_Festival.jpg"
      },
      "content": "HTML",
      "createdAt": "2022-12-21T15:13:15.400Z",
      "id": "1hv47u229ulbxso8eg"
    },
  ])
  const destination = res
  pipeline(source, destination, err => {
    if (err) console.log(err)
  })
})

// GET BLOGPOSTS STREAM ENDPOINT

const getBlogpostsJsonReadableStream = () => createReadStream(postsJSONPath)

postsRouter.get("/blogpostsJSON", (req, res, next) => {
  try {
    // SOURCES (file on disk, http request, ...) --> DESTINATION (file on disk, terminal, http response, ...)

    // SOURCE (READABLE STREAM on books.json file) --> DESTINATION (WRITABLE STREAM http response)

    res.setHeader("Content-Disposition", "attachment; filename=blogposts.json")
    // without this header the browser will try to open (not save) the file.
    // This header will tell the browser to open the "save file as" dialog
    const source = getBlogpostsJsonReadableStream()
    const transform = createGzip()
    const destination = res
    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})


postsRouter.post("/blogposts", checksPostsSchema, triggerBadRequest, (req, res, next) => {
  try {
    const newPost = { ...req.body, createdAt: new Date(), id: uniqid() }

    const postsArray = getPosts()

    postsArray.push(newPost)

    writePosts(postsArray)

    res.status(201).send({ id: newPost.id })
  } catch (error) {
    next(error) // with the next(error) I can send this error to the error handlers
  }
})



postsRouter.post("/blogPosts/:id/comments", checksPostsSchema, triggerBadRequest, (req, res, next) => {
  try {
    const newPost = { ...req.body.comments, updatedAt: new Date() }

    const postsArray = getPosts()

    postsArray.push(newPost)

    writePosts(postsArray)

    res.status(201).send({ id: newPost.id })
  } catch (error) {
    next(error) 
  }
})



postsRouter.get("/blogPosts", anotherStupidMiddleware, (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM")
    const postsArray = getPosts()
    if (req.query && req.query.category) {
      const filteredPosts = postsArray.filter(post => post.category === req.query.category)
      res.send(filteredPosts)
    } else {
      res.send(postsArray)
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/blogPosts/:id/comments", anotherStupidMiddleware, (req, res, next) => {
    try {
        const posts = getPosts()
        const post = posts.find(post => post.id.comments === req.params.postId)
        if (post) {
          res.send(post.comments)
        } else {
          // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
          next(NotFound(`Post with id ${req.params.postId} not found!`)) // --> err object {status: 404, message: `Book with id ${req.params.bookId} not found!` }
          // next(BadRequest("message")) // --> err object {status: 400, message: `message` }
          // next(Unauthorized("message")) // --> err object {status: 401, message: `message`}
        }
      } catch (error) {
        next(error)
      }
    })

postsRouter.get("/blogPosts/:postId", (req, res, next) => {
  try {
    const posts = getPosts()
    const post = posts.find(post => post.id === req.params.postId)
    if (post) {
      res.send(post)
    } else {
      // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      next(NotFound(`Post with id ${req.params.postId} not found!`)) // --> err object {status: 404, message: `Book with id ${req.params.bookId} not found!` }
      // next(BadRequest("message")) // --> err object {status: 400, message: `message` }
      // next(Unauthorized("message")) // --> err object {status: 401, message: `message`}
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.put("/blogPosts/:postId", (req, res, next) => {
  try {
    const posts = getPosts()

    const index = posts.findIndex(post => post.id === req.params.postId)
    if (index !== -1) {
      const oldPost = posts[index]

      const updatedPost = { ...oldPost, ...req.body, updatedAt: new Date() }

      posts[index] = updatedPost

      writePosts(posts)
      res.send(updatedPost)
    } else {
      next(NotFound(`Post with id ${req.params.postId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.delete("/blogPosts/:postId", (req, res, next) => {
  try {
    const posts = getPosts()

    const remainingPosts = posts.filter(post => post.id !== req.params.postId)

    if (posts.length !== remainingPosts.length) {
      writePosts(remainingPosts)
      res.status(204).send()
    } else {
      next(NotFound(`Post with id ${req.params.postId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default postsRouter