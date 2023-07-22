import { GraphQLSchema } from 'graphql';
// import { query } from './queries.js';

import { GraphQLObjectType, GraphQLBoolean, GraphQLNonNull, GraphQLList } from 'graphql';
import {
  member,
  post,
  profile,
  user,
  createPostInput,
  changePostInput,
  createProfileInput,
  changeProfileInput,
  createUserInput,
  changeUserInput,
  memberTypeId,
} from './graphqlTypes.js';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';

export const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createPost: {
      type: post,
      args: {
        dto: { type: new GraphQLNonNull(createPostInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.post.create({
          data: args.dto,
        }),
    },
    createUser: {
      type: user,
      args: {
        dto: { type: new GraphQLNonNull(createUserInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.user.create({
          data: args.dto,
        }),
    },
    createProfile: {
      type: profile,
      args: {
        dto: { type: new GraphQLNonNull(createProfileInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.profile.create({
          data: args.dto,
        }),
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_source, args, prisma: PrismaClient) => {
        try {
          await prisma.post.delete({
            where: {
              id: args.id,
            },
          });
          return true;
        } catch (err) {
          return false;
        }
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_source, args, prisma: PrismaClient) => {
        try {
          await prisma.profile.delete({
            where: {
              id: args.id,
            },
          });
          return true;
        } catch (err) {
          return false;
        }
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_source, args, prisma: PrismaClient) => {
        try {
          await prisma.user.delete({
            where: {
              id: args.id,
            },
          });
          return true;
        } catch (err) {
          return false;
        }
      },
    },
    changePost: {
      type: post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changePostInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
    changeProfile: {
      type: profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeProfileInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
    changeUser: {
      type: user,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeUserInput) },
      },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        }),
    },
  }),
});

export const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberTypes: {
      type: new GraphQLList(member),
      resolve: (_source, _args, prisma: PrismaClient) => prisma.memberType.findMany(),
    },
    posts: {
      type: new GraphQLList(post),
      resolve: (_source, _args, prisma: PrismaClient) => prisma.post.findMany(),
    },
    users: {
      type: new GraphQLList(user),
      resolve: (source, args, prisma: PrismaClient) => {
        // console.log('Context: ', ctx);
        return prisma.user.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(profile),
      resolve: (_source, _args, prisma: PrismaClient) => prisma.profile.findMany(),
    },
    memberType: {
      type: member,
      args: {
        id: {
          type: new GraphQLNonNull(memberTypeId),
        },
      },
      resolve: (source, args, prisma: PrismaClient, info) =>
        prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
    post: {
      type: post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_source, args, prisma: PrismaClient) =>
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
      resolve: (source, args, prisma: PrismaClient, info) =>
        prisma.user.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
    profile: {
      type: profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_source, args, prisma: PrismaClient) =>
        prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
  },
});

export const schema = new GraphQLSchema({
  query,
  mutation,
  // types: [member, user, post, profile],
});
