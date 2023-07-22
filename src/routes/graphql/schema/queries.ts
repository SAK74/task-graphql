import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { member, post, profile, user, memberTypeId } from './graphqlTypes.js';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../types/uuid.js';

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
