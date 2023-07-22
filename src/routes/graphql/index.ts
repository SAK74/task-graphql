import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './schema/schema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      console.log('request: ', req.body.query, req.body.variables);
      const res = await graphql({
        source: req.body.query,
        schema,
        variableValues: req.body.variables,
        contextValue: prisma,
      });
      console.log('result: ', res);
      return res;
    },
  });
};

export default plugin;
