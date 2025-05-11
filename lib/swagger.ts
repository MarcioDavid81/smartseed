import { createSwaggerSpec } from "next-swagger-doc";

export const getSwaggerSpec = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Smart Seed API",
        version: "1.0.0",
        description: "Documentação da API do sistema Smart Seed",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  return spec;
};
