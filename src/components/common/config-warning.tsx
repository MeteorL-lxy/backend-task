/**
 * 配置警告组件
 * 当缺少 Supabase 环境变量时展示提示
 */
export function ConfigWarning() {
  return (
    <section className="rounded-[24px] border border-amber-400/40 bg-amber-50 p-5 text-sm leading-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-400">
      缺少 Supabase 环境变量。请创建
      <code className="mx-1 rounded bg-surface-raised px-1.5 py-0.5">
        .env.local
      </code>
      ，填入项目地址和公开密钥，然后重启开发服务器。
    </section>
  );
}
