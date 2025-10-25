[[BEGIN]]

Meals — Context (v1)
الغرض والدور

تسجيل وعرض الوجبات لطفل محدد، مع بنود الوجبة وحساب الكارب/السعرات وربط الجرعة إن لزم.

المسارات المغطّاة

/child/:childId/meals

/child/:childId/meals/new

/child/:childId/meals/:mealId

الجداول والحقول المستخدمة (قراءة/كتابة)

meals: id, child_id, meal_time (timestamptz), meal_type, total_carbs_g, total_kcal, post_window_min, linked_bolus_id, notes, created_by

meal_items: id, meal_id, food_item_id, quantity, serving_unit, carbs_g, kcal, fiber_g, net_carbs_g, note

(قراءة) food_items / food_portions: البيانات المرجعية للحساب

(اختياري) insulin_doses: الربط بـ linked_bolus_id

عناصر الواجهة المنطقية (IDs/Sections)

#mealsTable, #newMealBtn

#mealForm (تاريخ/نوع/ملاحظات)

#mealBuilder لإضافة بنود من #foodPicker

#totalsBox (carbs/kcal)

الحالات والتحقق

يجب اختيار طفل صالح، ووقت وجبة صحيح.

على الأقل بند واحد في الوجبة، وقيم موجبة.

حساب totals من البنود (عرض/تحديث فوري).

الأفعال والتداعيات

إنشاء/تعديل/حذف وجبة وبنودها.

حساب totals تلقائيًا من البنود.

(اختياري) ربط جرعة بولس من insulin_doses.

الصلاحيات

guardian: CRUD على وجبات أطفاله.

doctor/dietitian: قراءة فقط.

admin: كامل.

خطوات الاختبار اليدوي

إنشاء وجبة بوقتها ونوعها + بندين → يظهر إجمالي الكارب/السعرات.

تعديل كمية بند → يتغيّر الإجمالي.

حذف بند/وجبة → يتحدث الجدول.

محاولة تعديل وجبة لطفل غير مملوك (guardian) → مرفوض.

تصفية حسب اليوم/النوع.

أسئلة مفتوحة

هل نحسب net_carbs تلقائيًا (fiber خصم) أم يدويًا؟

سياسة تعديل وجبات قديمة (قفل بعد X أيام؟)
[[END]]
