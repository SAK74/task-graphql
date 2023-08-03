import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import DataLoader from 'dataloader';
import { member, memberTypeId } from './member.js';
import { user } from './user.js';
import { CtxType } from './context.js';

export const profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      type: user,
      resolve: (source, _args, { prisma }: CtxType) =>
        prisma.user.findUnique({
          where: {
            id: source.userId,
          },
        }),
    },
    userId: { type: UUIDType },
    memberType: {
      type: member,
      resolve: (source, _args, { prisma, dataloaders }: CtxType, info) => {
        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (idx) => {
            const members = await prisma.memberType.findMany({
              where: {
                id: { in: idx as string[] },
              },
            });
            return idx.map((id) => members.find((m) => m.id === id));
          });
          dataloaders.set(info.fieldNodes, dl);
        }
        return dl.load(source.memberTypeId);
      },
      // prisma.memberType.findUnique({
      //   where: {
      //     id: source.memberTypeId,
      //   },
      // }),
    },
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

export const changeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});
