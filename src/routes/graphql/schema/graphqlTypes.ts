import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
// import { PrismaClient } from '@prisma/client';
import { MemberTypeId } from '../../member-types/schemas.js';
import { UUIDType } from '../types/uuid.js';
import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const memberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: MemberTypeId.BASIC,
    },
    business: {
      value: MemberTypeId.BUSINESS,
    },
  },
});

export const member = new GraphQLObjectType({
  name: 'Member',
  fields: () => ({
    id: { type: memberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(profile),
      resolve: (
        source,
        _args,
        {
          prisma,
        }: {
          prisma: PrismaClient;
          dataLoaders: WeakMap<{ [k: string]: any }, DataLoader<string, any>>;
        },
      ) =>
        prisma.profile.findMany({
          where: {
            memberTypeId: source.id,
          },
        }),
    },
  }),
});

export const post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: UUIDType,
    },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: {
      type: user,
      resolve: (source, _args, { prisma }) =>
        prisma.user.findUnique({
          where: {
            id: source.authorId,
          },
        }),
    },
    authorId: { type: UUIDType },
  }),
});

export const user = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLString },
    profile: {
      type: profile,
      resolve: (source, _args, { prisma }) =>
        prisma.profile.findUnique({
          where: {
            userId: source.id,
          },
        }),
    },
    posts: {
      type: new GraphQLList(post),
      resolve: (source, _args, { prisma }) =>
        prisma.post.findMany({
          where: {
            authorId: source.id,
          },
        }),
    },
    userSubscribedTo: {
      type: new GraphQLList(user),
      resolve: (source, _args, { prisma }) =>
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
      resolve: (source, _args, { prisma }) =>
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

export const profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      type: user,
      resolve: (source, _args, { prisma }) =>
        prisma.user.findUnique({
          where: {
            id: source.userId,
          },
        }),
    },
    userId: { type: UUIDType },
    memberType: {
      type: member,
      resolve: (
        source,
        _args,
        {
          prisma,
        }: {
          prisma: PrismaClient;
          dataLoaders: WeakMap<{ [k: string]: any }, DataLoader<string, any>>;
        },
      ) =>
        prisma.memberType.findUnique({
          where: {
            id: source.memberTypeId,
          },
        }),
    },
  }),
});

export const createPostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const createUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const createProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
  }),
});

export const changePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const changeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const changeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
