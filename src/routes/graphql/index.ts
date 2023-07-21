import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLSchema,
  graphql,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import { memberTypeId } from './schema.js';
import { UUIDType } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const member = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
      id: { type: memberTypeId },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
      profiles: {
        type: new GraphQLList(profile),
        resolve: (source) =>
          prisma.profile.findMany({
            where: {
              memberTypeId: source.id,
            },
          }),
      },
    }),
  });

  const post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: {
        type: UUIDType,
      },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
      author: {
        type: user,
        resolve: (source) =>
          prisma.user.findUnique({
            where: {
              id: source.authorId,
            },
          }),
      },
      authorId: { type: UUIDType },
    }),
  });

  const user = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLString },
      profile: {
        type: profile,
        resolve: (source) =>
          prisma.profile.findUnique({
            where: {
              userId: source.id,
            },
          }),
      },
      posts: {
        type: new GraphQLList(post),
        resolve: (source) =>
          prisma.post.findMany({
            where: {
              authorId: source.id,
            },
          }),
      },
      userSubscribedTo: {
        type: new GraphQLList(user),
        resolve: (source) =>
          prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: source.id,
                },
              },
            },
          }),
      },
      subscribedToUser: {
        type: new GraphQLList(user),
        resolve: (source) =>
          prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: source.id,
                },
              },
            },
          }),
      },
    }),
  });

  const profile = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      user: {
        type: user,
        resolve: (source) =>
          prisma.user.findUnique({
            where: {
              id: source.userId,
            },
          }),
      },
      userId: { type: UUIDType },
      memberType: {
        type: member,
        resolve: (source) =>
          prisma.memberType.findUnique({
            where: {
              id: source.memberTypeId,
            },
          }),
      },
    }),
  });

  const schema1 = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        memberTypes: {
          type: new GraphQLList(member),
          resolve: () => prisma.memberType.findMany(),
        },
        posts: {
          type: new GraphQLList(post),
          resolve: () => prisma.post.findMany(),
        },
        users: {
          type: new GraphQLList(user),
          resolve: () => prisma.user.findMany(),
        },
        profiles: {
          type: new GraphQLList(profile),
          resolve: () => prisma.profile.findMany(),
        },
        memberType: {
          type: member,
          args: {
            id: {
              type: new GraphQLNonNull(memberTypeId),
            },
          },
          resolve: (source, args, ctx, info) =>
            prisma.memberType.findUnique({
              where: {
                id: args.id,
              },
            }),
        },
        post: {
          type: post,
          args: { id: { type: new GraphQLNonNull(UUIDType) } },
          resolve: (source, args) =>
            prisma.post.findUnique({
              where: {
                id: args.id,
              },
            }),
        },
        user: {
          type: user,
          args: {
            id: { type: new GraphQLNonNull(UUIDType) },
          },
          resolve: (source, args, ctx, info) =>
            prisma.user.findUnique({
              where: {
                id: args.id,
              },
            }),
        },
        profile: {
          type: profile,
          args: { id: { type: new GraphQLNonNull(UUIDType) } },
          resolve: (source, args) =>
            prisma.profile.findUnique({
              where: {
                id: args.id,
              },
            }),
        },
      },
    }),
    // types: [member, user, post, profile],
  });
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
        schema: schema1,
        variableValues: req.body.variables,
      });
      console.log('result: ', res);
      return res;
    },
  });
};

export default plugin;
