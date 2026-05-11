/**
 * 用户档案信息面板
 * 展示在侧边栏顶部，显示用户基本信息和任务统计
 */

type ProfilePanelProps = {
  displayName: string | null;   // 展示用的昵称
  userEmail: string | null;     // 用户邮箱
  isProfileLoading: boolean;    // 档案是否加载中
  taskCount: number;            // 总任务数
  taskProgress: number;         // 完成百分比
};

/**
 * 用户信息卡片组件
 * 包含头像（首字母）、昵称、邮箱和三个统计指标
 */
export function ProfilePanel({
  displayName,
  userEmail,
  isProfileLoading,
  taskCount,
  taskProgress,
}: ProfilePanelProps) {
  return (
    <div className="rounded-[30px] border border-border bg-surface-raised p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)] dark:shadow-[0_26px_80px_-54px_rgba(0,0,0,0.5)]">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
        账号信息
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-xl font-semibold text-accent">
          {(displayName ?? "U").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-xl font-semibold text-text-primary">
            {displayName ?? "新用户"}
          </p>
          <p className="text-sm text-text-muted">{userEmail}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <MetricRow label="状态" value={isProfileLoading ? "读取中" : "正常"} />
        <MetricRow label="任务数" value={String(taskCount)} />
        <MetricRow label="完成度" value={`${taskProgress}%`} />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] bg-surface px-4 py-3 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
