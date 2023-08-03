import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql';
import { MemberTypeId } from '../../member-types/schemas.js';
import { profile } from './profile.js';
import { CtxType } from './context.js';

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
      resolve: (source, _args, { prisma }: CtxType) =>
        prisma.profile.findMany({
          where: {
            memberTypeId: source.id,
          },
        }),
    },
  }),
});
