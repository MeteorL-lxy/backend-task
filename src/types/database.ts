/**
 * 数据库类型定义
 * 手动维护的 Supabase 数据库类型，与 migrations 中的表结构保持一致
 */

/** 任务表（public.tasks）的字段类型 */
export type Task = {
  id: string;          // 任务唯一标识
  user_id: string;     // 所属用户（外键关联 auth.users）
  title: string;       // 任务标题
  description: string | null;  // 任务描述
  is_done: boolean;    // 是否已完成（向后兼容）
  status: "todo" | "in_progress" | "done"; // 看板状态：待办/进行中/已完成
  due_date: string | null;     // 截止日期（ISO 日期字符串）
  created_at: string;  // 创建时间
  updated_at: string;  // 最后更新时间
};

/** 用户档案表（public.profiles）的字段类型 */
export type Profile = {
  id: string;          // 用户唯一标识（与 auth.users.id 一致）
  email: string;       // 用户邮箱
  nickname: string | null;     // 昵称
  avatar_url: string | null;   // 头像 URL
  bio: string | null;          // 个人简介
  created_at: string;  // 创建时间
  updated_at: string;  // 最后更新时间
};

/**
 * Supabase 数据库完整类型定义
 * 用于 createBrowserClient / createServerClient 的类型参数
 */
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          is_done?: boolean;
          status?: "todo" | "in_progress" | "done";
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_done?: boolean;
          status?: "todo" | "in_progress" | "done";
          due_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          nickname?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
