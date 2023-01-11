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
      return [posts.title, posts.category, posts.author.name]
    })
  )

  const docDefinition = {
    content: [postsArray[0].title, postsArray[0].author.name, postsArray[0].category],
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}