
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { 
  createImportRecordInputSchema, 
  updateImportRecordInputSchema, 
  updateImportStatusInputSchema,
  importRecordFiltersSchema 
} from './schema';
import { createImportRecord } from './handlers/create_import_record';
import { getImportRecords } from './handlers/get_import_records';
import { getImportRecordById } from './handlers/get_import_record_by_id';
import { updateImportRecord } from './handlers/update_import_record';
import { updateImportStatus } from './handlers/update_import_status';
import { deleteImportRecord } from './handlers/delete_import_record';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new import record
  createImportRecord: publicProcedure
    .input(createImportRecordInputSchema)
    .mutation(({ input }) => createImportRecord(input)),
  
  // Get all import records with optional filtering
  getImportRecords: publicProcedure
    .input(importRecordFiltersSchema.optional())
    .query(({ input }) => getImportRecords(input)),
  
  // Get a single import record by ID
  getImportRecordById: publicProcedure
    .input(z.number())
    .query(({ input }) => getImportRecordById(input)),
  
  // Update an import record
  updateImportRecord: publicProcedure
    .input(updateImportRecordInputSchema)
    .mutation(({ input }) => updateImportRecord(input)),
  
  // Update import status and record stage transition
  updateImportStatus: publicProcedure
    .input(updateImportStatusInputSchema)
    .mutation(({ input }) => updateImportStatus(input)),
  
  // Delete an import record
  deleteImportRecord: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteImportRecord(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
