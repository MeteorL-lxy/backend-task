/**
 * 用户档案（Profile）相关 API
 * 负责 public.profiles 表的读取与更新
 */

import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/api/supabase/client";
import type { Profile } from "@/types/database";
import { readNicknameFromUser } from "@/utils/workspace";

/**
 * 确保用户档案存在
 * 登录后调用：若档案不存在则自动创建，存在则同步邮箱与昵称
 * @param user - 当前登录的 Supabase 用户
 * @returns 创建或更新后的 Profile 数据
 */
export async function ensureProfile(user: User) {
  const supabase = getSupabaseClient();
  const email = user.email ?? "";
  const defaultNickname =
    readNicknameFromUser(user) ?? user.email?.split("@")[0] ?? "新用户";

  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // 档案不存在：插入新记录
  if (!existingProfile) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email,
        nickname: defaultNickname,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // 档案存在：检查是否需要同步邮箱或昵称
  const nextNickname = existingProfile.nickname ?? defaultNickname;
  const shouldUpdate =
    existingProfile.email !== email || existingProfile.nickname !== nextNickname;

  if (!shouldUpdate) {
    return existingProfile;
  }

  // 执行更新
  const { data, error } = await supabase
    .from("profiles")
    .update({
      email,
      nickname: nextNickname,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 根据用户 ID 获取档案信息
 * @param userId - 用户 UUID
 * @returns Profile 数据，不存在时返回 null
 */
export async function fetchProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 更新用户档案字段
 * @param userId - 用户 UUID
 * @param input - 需要更新的字段（昵称、简介、头像地址）
 * @returns 更新后的 Profile 数据
 */
export async function updateProfile(
  userId: string,
  input: Pick<Profile, "nickname" | "bio" | "avatar_url">,
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nickname: input.nickname,
      bio: input.bio,
      avatar_url: input.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
