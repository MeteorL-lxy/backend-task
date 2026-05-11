/**
 * Framer Motion 动画配置共享库
 * 统一管理团队各处交互动画的参数
 */

import type { Variants, Transition } from "framer-motion";

/** 默认缓动曲线 */
export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeInOut = [0.4, 0, 0.2, 1] as const;

/** 默认过渡配置 */
export const defaultTransition: Transition = {
  duration: 0.35,
  ease: easeOut,
};

/** 快速过渡 */
export const quickTransition: Transition = {
  duration: 0.2,
  ease: easeOut,
};

/** 弹窗/面板：从上方淡入 + 轻微缩放 */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
  exit: { opacity: 0, transition: quickTransition },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: quickTransition,
  },
};

/** 列表项：从下方淡入 + 上移 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: quickTransition,
  },
};

/** 列表容器：级联子元素 */
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
};

/** 卡片：淡入 + 轻微上移 */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -8,
    transition: quickTransition,
  },
};

/** 看板列：卡片级联 */
export const kanbanColumnVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const kanbanCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
};

/** 空状态：缩放入场 */
export const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/** 按钮微交互 */
export const buttonTap = { scale: 0.97 };
export const buttonHover = { scale: 1.02 };

/** 侧边栏/面板滑入 */
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: quickTransition,
  },
};

/** 淡入 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: quickTransition,
  },
};
