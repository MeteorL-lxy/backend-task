/**
 * 设置页路由入口
 * 委托给 SettingsScreen 组件渲染实际界面
 */

import { SettingsScreen } from "@/app/settings/settings-screen";

export default function SettingsPage() {
  return <SettingsScreen />;
}
