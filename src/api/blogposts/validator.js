import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const postSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
}

export const checksPostsSchema = checkSchema(postSchema)

export const triggerBadRequest = (req, res, next) => {
  // 1. Check if previous middleware ( checksBooksSchema) has detected any error in req.body
  const errors = validationResult(req)

  console.log(errors.array())

  if (!errors.isEmpty()) {
    // 2.1 If we have any error --> trigger error handler 400
    next(createHttpError(400, "Errors during post validation", { errorsList: errors.array() }))
  } else {
    // 2.2 Else (no errors) --> normal flow (next)
    next()
  }
}

// VALIDATION CHAIN 1. checksBooksSchema --> 2. triggerBadRequest