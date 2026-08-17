import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "Production-grade E-commerce REST API documentation",
      contact: {
        name: "Karunesh Gupta",
        email: "developer@elens.in",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        // ── Reusable response schemas ──
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
            errors: { type: "array", items: { type: "string" } },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65abc123def4567890" },
            name: { type: "string", example: "Karunesh Gupta" },
            email: { type: "string", example: "user@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            avatar: { type: "string", example: "" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Nike Air Max" },
            slug: { type: "string", example: "nike-air-max" },
            description: { type: "string" },
            price: { type: "number", example: 4999 },
            discountPrice: { type: "number", example: 3999 },
            stock: { type: "number", example: 50 },
            brand: { type: "string", example: "Nike" },
            ratings: { type: "number", example: 4.5 },
            numReviews: { type: "number", example: 12 },
            isFeatured: { type: "boolean" },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  public_id: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Products", description: "Product management endpoints" },
      { name: "Categories", description: "Category management endpoints" },
      { name: "Cart",     description: "Shopping cart endpoints" },
      { name: "Orders",   description: "Order management endpoints" },
      { name: "Payments", description: "Payment & checkout endpoints" },
      { name: "Wishlist", description: "Wishlist endpoints" },
      { name: "Reviews",  description: "Product review endpoints" },
    ],
  },
  // Routes files se JSDoc comments scan karo
  apis: ["./src/features/**/*.routes.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
