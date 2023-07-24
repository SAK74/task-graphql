import { GraphQLSchema } from 'graphql';
import { mutation } from './mutations.js';
import { query } from './queries.js';

export const schema = new GraphQLSchema({
  query,
  mutation,
  // types: [member, user, post, profile],
});
