import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { UUIDType } from './types/uuid.js';
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
  ResolveTree,
} from 'graphql-parse-resolve-info';
import { member, memberTypeId } from './types/member.js';
import { CtxType } from './types/context.js';
import { post } from './types/post.js';
import { user } from './types/user.js';
import { profile } from './types/profile.js';

export const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberTypes: {
      type: new GraphQLList(member),
      resolve: (_source, _args, { prisma }: CtxType) => {
        return prisma.memberType.findMany();
      },
    },
    posts: {
      type: new GraphQLList(post),
      resolve: (_source, _args, { prisma }: CtxType) => prisma.post.findMany(),
    },
    users: {
      type: new GraphQLList(user),
      resolve: (source, args, { prisma }: CtxType, info) => {
        const parsedResolveInfoFragment = parseResolveInfo(info);
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          parsedResolveInfoFragment as ResolveTree,
          new GraphQLList(user),
        );
        // console.log('resolve tree: ', parsedResolveInfoFragment);
        // console.log('simpli fields: ', fields);
        const fieldsNames = Object.keys(fields);
        return prisma.user.findMany({
          include: {
            subscribedToUser: fieldsNames.includes('subscribedToUser'),
            userSubscribedTo: fieldsNames.includes('userSubscribedTo'),
          },
        });
      },
    },
    profiles: {
      type: new GraphQLList(profile),
      resolve: (_source, _args, { prisma }: CtxType) => prisma.profile.findMany(),
    },
    memberType: {
      type: member,
      args: {
        id: {
          type: new GraphQLNonNull(memberTypeId),
        },
      },
      resolve: (source, args, { prisma }: CtxType, info) =>
        prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
    post: {
      type: post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_source, args, { prisma }: CtxType) =>
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
      resolve: (source, args, { prisma }: CtxType, info) =>
        prisma.user.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
    profile: {
      type: profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_source, args, { prisma }: CtxType) =>
        prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        }),
    },
  },
});
