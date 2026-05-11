/**
 * 设置页的业务逻辑 Hook
 * 管理个人资料编辑、认证状态及表单数据
 */

"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/app/auth-provider";
import type { Profile } from "@/types/database";
import {
  signIn,
  signOut,
  signUp,
  updateAuthProfile,
} from "@/api/auth";
import {
  ensureProfile,
  fetchProfile,
  updateProfile,
} from "@/api/profile";
import type {
  AuthFormState,
  AuthMode,
  MessageTone,
} from "@/types/workspace";
import { getErrorMessage, readNicknameFromUser } from "@/utils/workspace";
import { validateForm, hasErrors, type FieldErrors } from "@/lib/validation";
import { settingsFormSchema } from "@/lib/form-schemas";

/** 设置表单的数据结构 */
type SettingsFormState = {
  nickname: string;
  bio: string;
  avatarUrl: string;
};

/** 认证表单默认值 */
const defaultAuthForm: AuthFormState = {
  email: "",
  password: "",
  nickname: "",
};

/** 设置表单默认值 */
const defaultSettingsForm: SettingsFormState = {
  nickname: "",
  bio: "",
  avatarUrl: "",
};

/**
 * 设置页状态管理 Hook
 * @returns 设置页所需的全部状态与操作方法
 */
export function useSettingsScreen() {
  const { isAuthReady, user } = useAuthSession();
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [authForm, setAuthForm] = useState<AuthFormState>(defaultAuthForm);
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(
    defaultSettingsForm,
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("neutral");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState<FieldErrors<"nickname" | "avatarUrl" | "bio">>({});

  // 展示名称优先级：档案昵称 > 认证元数据昵称 > 邮箱前缀
  const displayName =
    profile?.nickname || readNicknameFromUser(user) || user?.email?.split("@")[0] || null;

  /**
   * 用户登录后加载档案数据
   * 将档案信息同步到设置表单中
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isActive = true;

    async function bootstrap() {
      setIsProfileLoading(true);
      setMessage("");
      setProfile(null);
      setSettingsForm(defaultSettingsForm);

      try {
        const ensuredProfile = await ensureProfile(currentUser);
        const nextProfile = ensuredProfile ?? await fetchProfile(currentUser.id);

        if (!isActive || !nextProfile) {
          return;
        }

        setProfile(nextProfile);
        setSettingsForm({
          nickname: nextProfile.nickname ?? "",
          bio: nextProfile.bio ?? "",
          avatarUrl: nextProfile.avatar_url ?? "",
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMessage(getErrorMessage(error, "加载设置失败。"));
        setMessageTone("error");
      } finally {
        if (isActive) {
          setIsProfileLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, [user]);

  /** 提交登录或注册表单 */
  async function submitAuth() {
    setIsAuthLoading(true);
    setMessage("");

    try {
      if (authMode === "sign-in") {
        const { error } = await signIn(authForm.email, authForm.password);
        if (error) {
          throw error;
        }

        setMessage("欢迎回来，已经登录。");
      } else {
        const { error } = await signUp(
          authForm.email,
          authForm.password,
          authForm.nickname.trim(),
        );
        if (error) {
          throw error;
        }

        setMessage("账号已创建。");
      }

      setMessageTone("success");
      setAuthForm((current) => ({
        ...current,
        password: "",
        nickname: "",
      }));
    } catch (error) {
      setMessage(getErrorMessage(error, "操作失败，请稍后再试。"));
      setMessageTone("error");
    } finally {
      setIsAuthLoading(false);
    }
  }

  /** 退出登录并清空本地状态 */
  async function logout() {
    await signOut();
    setProfile(null);
    setSettingsForm(defaultSettingsForm);
    setMessage("你已退出当前账号。");
    setMessageTone("neutral");
  }

  /** 保存用户设置到数据库，同时同步认证元数据 */
  async function saveSettings() {
    if (!user) {
      return;
    }

    // 表单验证
    const errors = validateForm(settingsForm, settingsFormSchema);
    if (hasErrors(errors)) {
      setSettingsErrors(errors);
      return;
    }
    setSettingsErrors({});

    setIsSaving(true);
    setMessage("");

    try {
      // 更新 public.profiles 表
      const nextProfile = await updateProfile(user.id, {
        nickname: settingsForm.nickname.trim() || null,
        bio: settingsForm.bio.trim() || null,
        avatar_url: settingsForm.avatarUrl.trim() || null,
      });
      // 同步更新 auth.users 的元数据（确保昵称在各处一致）
      const { error } = await updateAuthProfile({
        nickname: nextProfile.nickname,
      });

      if (error) {
        throw error;
      }

      setProfile(nextProfile);
      setMessage("设置已更新。");
      setMessageTone("success");
    } catch (error) {
      setMessage(getErrorMessage(error, "保存设置失败。"));
      setMessageTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    authForm,
    authMode,
    displayName,
    isAuthLoading,
    isAuthReady,
    isProfileLoading,
    isSaving,
    message,
    messageTone,
    profile,
    saveSettings,
    setAuthForm,
    setAuthMode,
    setSettingsForm,
    settingsForm,
    submitAuth,
    user,
    logout,
    settingsErrors,
  };
}
