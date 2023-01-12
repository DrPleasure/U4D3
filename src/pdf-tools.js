import PdfPrinter from "pdfmake"

export const getPDFReadableStream = postsArray => {
  // Define font files
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  }

  const printer = new PdfPrinter(fonts)

  console.log(
    postsArray.map(posts => {
      return [posts.title, posts.category, posts.author.name, posts.article, posts.image]
    })
  )

  const docDefinition = {
    content: [postsArray[0].title, postsArray[0].author.name, postsArray[0].category, postsArray[0].image, postsArray[0].article, ]
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}