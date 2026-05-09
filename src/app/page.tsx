/**
 * 首页路由入口
 * 委托给 HomeScreen 组件渲染实际界面
 */

import { HomeScreen } from "@/app/_home/home-screen";

export default function Home() {
  return <HomeScreen />;
}
