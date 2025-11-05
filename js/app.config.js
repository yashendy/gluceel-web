window.APP_CONFIG = {
  PUBLIC_SITE_URL: "https://yashendy.github.io/gluceel-web/",
  BASE_PATH: "/gluceel-web/",
  SUPABASE_URL: "https://ekczlogtrfpupgjlysfv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_aVyjU4QkRDjrpn_DfQQ4lA_O1cQelsU",

  TABLES: {
    profiles: "profiles",
    user_settings: "user_settings",        // جديد
    guardian_settings: "guardian_settings",// اختياري (لو شغّلتِ سكربته)
    children: "children",
    measurements: "measurements",
    meals: "meals",
    meal_items: "meal_items",
    targets: "targets",
    rewards_points_ledger: "rewards_points_ledger",
    shares: "share_access"
  },

  COLUMNS: {
    profiles: {
      user_id: "user_id",
      role: "role",
      full_name: "full_name",
      phone: "phone",
      avatar_url: "avatar_url",
      locale: "locale",
      timezone: "timezone",
      onboarding_complete: "onboarding_complete",
      default_child_id: "default_child_id",
      preferred_glucose_unit: "preferred_glucose_unit",
      hypo_default: "hypo_threshold_default",
      hyper_default: "hyper_threshold_default",
      notify_email: "notify_email",
      notify_push: "notify_push",
      emergency_contact_name: "emergency_contact_name",
      emergency_contact_phone: "emergency_contact_phone"
    },
    children:     { id: "id", name: "display_name" },
    measurements: { id:"id", child_id:"child_id", value:"glucose_mgdl", context:"context", at:"observed_at", notes:"notes" },
    targets:      { child_id:"child_id", low:"low_mgdl", high:"high_mgdl" }
  },

  AI: {
    MODE: "local",
    LOCALE_DEFAULT: "ar",
    USE_CHILD_CONTEXT_DEFAULT: true,
    PRIVACY: "local-only"
  }
};
