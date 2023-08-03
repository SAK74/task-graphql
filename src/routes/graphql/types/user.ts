import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import DataLoader from 'dataloader';
import { profile } from './profile.js';
import { CtxType } from './context.js';
import { post } from './post.js';

export const user = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLString },

    profile: {
      type: profile,
      resolve: (source, _args, { prisma, dataloaders }: CtxType, info) => {
        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (idx) => {
            const profiles = await prisma.profile.findMany({
              where: { userId: { in: idx as string[] } },
            });
            return idx.map((id) => profiles.find(({ userId }) => userId === id));
          });
          dataloaders.set(info.fieldNodes, dl);
        }
        return dl.load(source.id);
      },
      // prisma.profile.findUnique({
      //   where: {
      //     userId: source.id,
      //   },
      // }),
    },

    posts: {
      type: new GraphQLList(post),
      resolve: (source, _args, { prisma, dataloaders }, info) => {
        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (idx) => {
            const posts = await prisma.post.findMany({
              where: {
                authorId: { in: idx as string[] },
              },
            });
            return idx.map((id) => posts.filter(({ authorId }) => authorId === id));
          });
          dataloaders.set(info.fieldNodes, dl);
        }
        const post = dl.load(source.id);
        return post;
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(user),
      resolve: (source, _args, { prisma, dataloaders }, info) => {
        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (idx) => {
            const authors = await prisma.user.findMany({
              include: { subscribedToUser: true },
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: { in: idx as string[] },
                  },
                },
              },
            });
            return idx.map((id) =>
              authors.filter(({ subscribedToUser }) =>
                subscribedToUser.some((user) => user.subscriberId === id),
              ),
            );
          });
          dataloaders.set(info.fieldNodes, dl);
        }
        return dl.load(source.id);
      },
    },

    subscribedToUser: {
      type: new GraphQLList(user),
      resolve: (source, _args, { prisma, dataloaders }: CtxType, info) => {
        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (idx) => {
            const subscribers = await prisma.user.findMany({
              include: { userSubscribedTo: true },
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: { in: idx as string[] },
                  },
                },
              },
            });
            return idx.map((id) =>
              subscribers.filter(({ userSubscribedTo }) =>
                userSubscribedTo.some((user) => user.authorId === id),
              ),
            );
          });
          dataloaders.set(info.fieldNodes, dl);
        }
        return dl.load(source.id);
      },
    },
  }),
});

export const createUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const changeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
