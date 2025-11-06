// js/app.config.js
window.APP_CONFIG = {
  // عدّلي المفتاح/الـURL هنا فقط لو عملتِ Rotate من لوحة Supabase
  SUPABASE_URL: "https://ekczlogtrfpupgjlysfv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_aVyjU4QkRDjrpn_DfQQ4lA_O1cQelsU",

  // مسارات العرض على GitHub Pages
  PUBLIC_SITE_URL: "https://yashendy.github.io/gluceel-web/",
  BASE_PATH: "/gluceel-web/",

  // لسهولة تفريغ الكاش عند التغيير (اختياري)
  VERSION: "v1.0.3",

  TABLES: {
    profiles: "profiles",
    user_settings: "user_settings",          // إعدادات المستخدم (وليّ الأمر/الطبيب)
    guardian_settings: "guardian_settings",  // اختياري لو فعلتِ جدول الإعدادات العام
    children: "children",
    measurements: "measurements",
    meals: "meals",
    meal_items: "meal_items",
    targets: "targets",
    rewards_points_ledger: "rewards_points_ledger",
    shares: "share_access"
  },

  COLUMNS: {
    // أعمدة موجودة فعليًا في profiles
    profiles: {
      user_id: "user_id",
      role: "role",
      full_name: "full_name",
      phone: "phone",
      avatar_url: "avatar_url",
      onboarding_complete: "onboarding_complete",
      default_child_id: "default_child_id",
      emergency_contact_name: "emergency_contact_name",
      emergency_contact_phone: "emergency_contact_phone"
    },

    // جداول التشغيل
    children:     { id: "id", name: "display_name" },
    measurements: { id: "id", child_id: "child_id", value: "glucose_mgdl", context: "context", at: "observed_at", notes: "notes" },
    targets:      { child_id: "child_id", low: "low_mgdl", high: "high_mgdl" }
  },

  // إعدادات محادثة الذكاء الاصطناعي المحلية (يمكن تعديلها لاحقًا)
  AI: {
    MODE: "local",
    LOCALE_DEFAULT: "ar",
    USE_CHILD_CONTEXT_DEFAULT: true,
    PRIVACY: "local-only"
  }
};
