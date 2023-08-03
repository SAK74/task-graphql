import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { user } from './user.js';
import { CtxType } from './context.js';

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
      resolve: (source, _args, { prisma }: CtxType) =>
        prisma.user.findUnique({
          where: {
            id: source.authorId,
          },
        }),
    },
    authorId: { type: UUIDType },
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

export const changePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});
