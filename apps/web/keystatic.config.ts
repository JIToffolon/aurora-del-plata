import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "slug",
      path: "src/content/posts/*",
      schema: {
        title: fields.text({ label: "Título", validation: { isRequired: true } }),
        slug: fields.slug({ name: { label: "Slug" } }),
        coverImage: fields.image({
          label: "Imagen de portada",
          directory: "src/assets/posts",
          publicPath: "@assets/posts/",
          validation: { isRequired: true }
        }),
        excerpt: fields.text({ label: "Resumen", multiline: true }),
        category: fields.select({
          label: "Categoría",
          options: [
            { label: "Ciencia", value: "ciencia" },
            { label: "Argentina", value: "argentina" },
            { label: "Mundo", value: "mundo" }
          ],
          defaultValue: "ciencia"
        }),
        date: fields.date({ label: "Fecha" }),
        content: fields.markdoc({ label: "Contenido" })
      }
    })
  }
});