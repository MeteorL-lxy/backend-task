/**
 * 配置警告组件
 * 当缺少 Supabase 环境变量时展示提示
 */
export function ConfigWarning() {
  return (
    <section className="rounded-[24px] border border-[#cfa985] bg-[#fff6eb] p-5 text-sm leading-6 text-[#734623]">
      缺少 Supabase 环境变量。请创建
      <code className="mx-1 rounded bg-white px-1.5 py-0.5">
        .env.local
      </code>
      ，填入项目地址和公开密钥，然后重启开发服务器。
    </section>
  );
}
