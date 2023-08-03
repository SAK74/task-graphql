import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export interface CtxType {
  prisma: PrismaClient;
  dataloaders: WeakMap<{ [k: string]: any }, DataLoader<string, unknown>>;
}
