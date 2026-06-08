export function runMigrations(exec: (sql: string) => void, schemaSql: string): void {
  exec(schemaSql);
}
