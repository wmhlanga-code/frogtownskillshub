import { getCurrentAdmin, createServiceRoleClient } from '@/lib/admin'

// One-time setup route. Requires a Postgres helper function to already exist,
// since the Supabase JS client has no raw-SQL execution method — only RPC
// calls to functions that are already defined in the database. Run this once
// in the Supabase SQL editor before calling this route:
//
//   create or replace function exec_sql(sql text)
//   returns void as $$
//   begin
//     execute sql;
//   end;
//   $$ language plpgsql security definer;
const POLICIES: { name: string; sql: string }[] = [
  {
    name: 'seeker_own_threads',
    sql: `CREATE POLICY IF NOT EXISTS seeker_own_threads
      ON message_threads FOR SELECT
      USING (seeker_id::text = auth.uid()::text);`,
  },
  {
    name: 'offerer_own_threads',
    sql: `CREATE POLICY IF NOT EXISTS offerer_own_threads
      ON message_threads FOR SELECT
      USING (
        offerer_id IN (
          SELECT id FROM skill_offerers
          WHERE email = auth.email()
        )
      );`,
  },
  {
    name: 'create_thread',
    sql: `CREATE POLICY IF NOT EXISTS create_thread
      ON message_threads FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);`,
  },
  {
    name: 'read_own_messages',
    sql: `CREATE POLICY IF NOT EXISTS read_own_messages
      ON messages FOR SELECT
      USING (
        thread_id IN (
          SELECT id FROM message_threads
          WHERE seeker_id::text = auth.uid()::text
          OR offerer_id IN (
            SELECT id FROM skill_offerers
            WHERE email = auth.email()
          )
        )
      );`,
  },
  {
    name: 'send_messages',
    sql: `CREATE POLICY IF NOT EXISTS send_messages
      ON messages FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);`,
  },
  {
    name: 'mark_read',
    sql: `CREATE POLICY IF NOT EXISTS mark_read
      ON messages FOR UPDATE
      USING (
        thread_id IN (
          SELECT id FROM message_threads
          WHERE seeker_id::text = auth.uid()::text
          OR offerer_id IN (
            SELECT id FROM skill_offerers
            WHERE email = auth.email()
          )
        )
      );`,
  },
  {
    name: 'insert_reports',
    sql: `CREATE POLICY IF NOT EXISTS insert_reports
      ON reports FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);`,
  },
]

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()
  const results: { name: string; success: boolean; error?: string }[] = []

  for (const policy of POLICIES) {
    const { error } = await service.rpc('exec_sql', { sql: policy.sql })
    results.push({ name: policy.name, success: !error, error: error?.message })
  }

  const allSucceeded = results.every((r) => r.success)

  return Response.json(
    { success: allSucceeded, results },
    { status: allSucceeded ? 200 : 500 }
  )
}
