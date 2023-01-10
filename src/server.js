// const express = require("express") // OLD IMPORT SYNTAX
import express from "express" // NEW IMPORT SYNTAX (do not forget to add type: "module" to package.json to use this!!)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import createHttpError from "http-errors"
import postsRouter from "./api/blogposts/index.js"
import {
    genericErrorHandler,
    notFoundHandler,
    badRequestHandler,
    unauthorizedHandler,
  } from "./errorHandlers.js"

const server = express()

const publicFolderPath = join(process.cwd(), "./public")


FE="http://localhost:3000"
BE="http://localhost:3001"

// ***************** MIDDLEWARES ********************

const loggerMiddleware = (req, res, next) => {
  // console.log(req.headers)
  console.log(`Request method ${req.method} -- url ${req.url} -- ${new Date()}`)
  req.user = "Dan"
  next() // gives the control to whom is coming next (either another middleware or route handler)
}

/* const policeOfficerMiddleware = (req, res, next) => {
  console.log("Current user:", req.user)
  if (req.user === "Riccardo") {
    res.status(403).send({ message: "Riccardos are not allowed!" }) // Middlewares could decide to end the flow
  } else {
    next()
  }
} */
const port = process.env.PORT


const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If current origin is in the whitelist you can move on
      corsNext(null, true)
    } else {
      // If it is not --> error
      corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist!`))
    }
  },
}

server.use(express.static(publicFolderPath))

server.use(cors(corsOpts)) // Just to let FE communicate with BE successfully
server.use(loggerMiddleware)
/* server.use(policeOfficerMiddleware) */
server.use(express.json()) // If you do not add this line here BEFORE the endpoints, all req.body will be UNDEFINED

// ****************** ENDPOINTS *********************
server.use("/", loggerMiddleware, postsRouter) // All users related endpoints will share the same /users prefix in their urls

// ****************** ERROR HANDLERS ****************
 server.use(badRequestHandler) // 400
 server.use(unauthorizedHandler) // 401
 server.use(notFoundHandler) // 404
 server.use(genericErrorHandler) // 500
// (the order of these error handlers does not really matters, expect for genericErrorHandler which needs to be the last in chain)

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log("Server is running on port:", port)
})