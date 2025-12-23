import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pump-DB API",
      version: "1.0.0",
      description: "API documentation for Pump-DB project 🚀",
    },
    servers: [
      {
        url: process.env.ROOT_URL,
        description: "Local dev server",
      },
    ],
  },
//   Look for JS Doc comments using dynamic route approach
  apis: ["./routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
