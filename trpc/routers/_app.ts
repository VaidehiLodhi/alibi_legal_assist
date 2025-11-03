
import { projectRouter } from '@/modules/projects/procedures';
import { createTRPCRouter } from '../init';
import { messagesRouter } from '@/modules/messages/server/procedures';
import { reportsRouter } from '@/modules/reports/server/procedures';
export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectRouter,
  reports: reportsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;