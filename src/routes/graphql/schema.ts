import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { MemberTypeId } from '../member-types/schemas.js';
import { UUIDType } from './types/uuid.js';

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
    author: { type: user },
    authorId: { type: UUIDType },
  }),
});

export const user = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLString },
    profile: { type: profile },
    posts: { type: new GraphQLList(post) },
    // userSubscribedTo:
  }),
});

export const profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: { type: user },
    userId: { type: UUIDType },
    memberType: { type: member },
  }),
});
