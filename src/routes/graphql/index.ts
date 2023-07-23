import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import { schema } from './schema/schema.js';
import depthLimit from 'graphql-depth-limit';

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
    async handler(req, reply) {
      const validateErr = validate(schema, parse(req.body.query), [depthLimit(5)]);
      console.log('request: ', req.body.query, req.body.variables);
      console.log('validate: ', validateErr);
      if (validateErr.length) {
        reply.send({ errors: validateErr });
      } else {
        const res = await graphql({
          source: req.body.query,
          schema,
          variableValues: req.body.variables,
          contextValue: { prisma, dataLoaders: new WeakMap() },
        });
        console.log('result: ', res);
        return res;
      }
    },
  });
};

export default plugin;
