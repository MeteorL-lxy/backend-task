/**
 * 数据库迁移脚本
 * 读取 migrations/ 目录下的 SQL 文件并按顺序执行
 * 使用 schema_migrations 表记录已执行的迁移，支持幂等运行
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const projectRoot = process.cwd();
const envFile = path.join(projectRoot, ".env.db.local");
const migrationsDir = path.join(projectRoot, "migrations");

/**
 * 读取 .env 文件并解析为键值对对象
 * @param filePath - 环境变量文件路径
 * @returns 解析后的环境变量对象
 */
async function readEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const pairs = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const dividerIndex = line.indexOf("=");
        if (dividerIndex === -1) {
          return null;
        }

        const key = line.slice(0, dividerIndex).trim();
        const value = line.slice(dividerIndex + 1).trim();
        return [key, value];
      })
      .filter(Boolean);

    return Object.fromEntries(pairs);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

/**
 * 确保 schema_migrations 表存在（用于记录已执行的迁移）
 * @param client - PostgreSQL 客户端
 */
async function ensureMigrationTable(client) {
  await client.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      executed_at timestamptz not null default now()
    )
  `);
}

/**
 * 获取已执行的迁移文件列表
 * @param client - PostgreSQL 客户端
 * @returns 已执行迁移文件名的 Set
 */
async function getExecutedMigrations(client) {
  const result = await client.query("select name from public.schema_migrations");
  return new Set(result.rows.map((row) => row.name));
}

/**
 * 读取 migrations 目录下的所有 SQL 文件并按文件名排序
 * @returns 排序后的 SQL 文件名数组
 */
async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
}

/**
 * 主函数：执行数据库迁移
 * 1. 读取环境变量获取数据库连接信息
 * 2. 连接数据库并确保 schema_migrations 表存在
 * 3. 按顺序执行未执行的 SQL 迁移文件
 * 4. 每个迁移在事务中执行，失败自动回滚
 */
async function main() {
  const env = {
    ...process.env,
    ...(await readEnvFile(envFile)),
  };

  if (!env.DATABASE_URL) {
    console.error(
      "Missing DATABASE_URL. Create .env.db.local from .env.db.local.example and fill in your database password.",
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    await ensureMigrationTable(client);
    const executed = await getExecutedMigrations(client);
    const migrationFiles = await getMigrationFiles();

    for (const fileName of migrationFiles) {
      if (executed.has(fileName)) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, fileName), "utf8");

      console.log(`Applying ${fileName}...`);
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public.schema_migrations(name) values ($1)", [fileName]);
      await client.query("commit");
    }

    console.log("Database is up to date.");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
