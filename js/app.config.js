window.APP_CONFIG = {
  PUBLIC_SITE_URL: "https://yashendy.github.io/gluceel-web/",
  BASE_PATH: "/gluceel-web/",
  SUPABASE_URL: "https://ekczlogtrfpupgjlysfv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_aVyjU4QkRDjrpn_DfQQ4lA_O1cQelsU",
  TABLES: {
    profiles: "profiles",
    children: "children",
    measurements: "measurements",
    meals: "meals",
    meal_items: "meal_items",
    targets: "targets",
    rewards_points_ledger: "rewards_points_ledger",
    shares: "share_access"
  },
  COLUMNS: {
    children: { id: "id", name: "display_name" }, // ← شِلنا unit
    measurements: { id:"id", child_id:"child_id", value:"glucose_mgdl", context:"context", at:"observed_at", notes:"notes" },
    targets: { child_id:"child_id", low:"low_mgdl", high:"high_mgdl" },
    meals: { id:"id", child_id:"child_id", at:"datetime", name:"name", total_carbs:"total_carbs" }
  },
  AI: { MODE:"local", LOCALE_DEFAULT:"ar", USE_CHILD_CONTEXT_DEFAULT:true, PRIVACY:"local-only" }
};
