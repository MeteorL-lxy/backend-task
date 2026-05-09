/**
 * 设置页资料预览卡片
 * 展示用户当前的头像、昵称、邮箱和简介
 */

type SettingsSummaryCardProps = {
  displayName: string | null;   // 展示用的昵称
  userEmail: string | null;     // 用户邮箱
  avatarUrl: string | null;     // 头像地址
  bio: string | null;           // 个人简介
  isProfileLoading: boolean;    // 是否加载中
};

/**
 * 资料预览组件
 * 头像为空时展示首字母占位图
 */
export function SettingsSummaryCard({
  displayName,
  userEmail,
  avatarUrl,
  bio,
  isProfileLoading,
}: SettingsSummaryCardProps) {
  return (
    <div className="rounded-[30px] border border-[#dbe0d4] bg-white/90 p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)]">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
        资料预览
      </p>
      <div className="mt-4 flex items-center gap-4">
        {avatarUrl ? (
          <div
            aria-label={displayName ?? "头像"}
            className="h-16 w-16 rounded-full bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6efe9] text-2xl font-semibold text-[#1b4332]">
            {(displayName ?? "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-semibold text-[#17211b]">
            {displayName ?? "新用户"}
          </p>
          <p className="text-sm text-[#677367]">{userEmail}</p>
        </div>
      </div>
      <div className="mt-5 rounded-[18px] bg-[#f6f7f3] p-4 text-sm leading-6 text-[#5a655d]">
        {isProfileLoading
          ? "正在读取你的设置..."
          : bio || "你还没有填写简介。"}
      </div>
    </div>
  );
}
