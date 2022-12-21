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

const { NotFound, Unauthorized, BadRequest } = httpErrors

const postsRouter = express.Router()

const postsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "posts.json")

const anotherStupidMiddleware = (req, res, next) => {
  console.log("I am a stupid middleware")
  next()
}

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath))
const writePosts = postsArray => fs.writeFileSync(postsJSONPath, JSON.stringify(postsArray))

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