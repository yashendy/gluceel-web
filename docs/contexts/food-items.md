BEGIN]]

Food Items — Context (v1)
الغرض والدور

مكتبة الأصناف الغذائية (CRUD)، إدارة الفئات والحصص، رفع صورة للصنف، والبحث/التصفية.

المسارات المغطّاة

/food-items (قائمة/بحث/تصفية)

/food-items/new, /food-items/:id

الجداول والحقول المستخدمة (قراءة/كتابة)

food_categories: id, slug, name, is_active

food_items: id, name, category_id, brand, is_branded, lang, barcode_gtin, serving_size, serving_unit, (carbs/protein/fat/kcal)_per_100, (fiber/sugars/sodium)_per_100, is_active, source, image (Storage via attachments or مباشر bucket)

food_portions: id, food_item_id, measure, quantity, grams

عناصر الواجهة المنطقية (IDs/Sections)

#itemsTable, #searchInput, #categoryFilter, #activeFilter

#itemForm (حقول أساسية + صورة)

#portionsSection (قائمة الحصص وإضافتها)

#imagePicker, .preview

الحالات والتحقق

name, category_id, القيم لكل 100 ثابتة ≥ 0.

serving_unit ضمن g/ml/piece.

منع ازدواجية خطيرة: (name, brand, serving_unit) اختيارياً فريد.

الأفعال والتداعيات

Create/Update/Delete للصنف والفئة/الحصص (حسب الدور).

رفع صورة إلى Bucket food-items مع فحص النوع والحجم.

عند التعطيل is_active=false → لا يظهر في منتقي الوجبات.

الصلاحيات

dietitian/admin: CRUD كامل.

guardian/doctor: قراءة، (اختياري) طلب اقتراح صنف جديد عبر عملية مراجعة.

خطوات الاختبار اليدوي

إضافة صنف مع صورة وحصّة واحدة → يظهر فورًا في الجدول والبحث.

تعديل القيم لكل 100 → تتحدّث نتائج الحِساب في الوجبات لاحقًا.

تعطيل الصنف → لا يظهر في منتقي الوجبات.

تصفية حسب الفئة + بحث جزئي في الاسم/العلامة.

أسئلة مفتوحة

هل نسمح بإضافة أصناف من المستخدمين (guardian) بمراجعة؟

أين نخزّن الرابط النهائي للصورة (عمود image_url أم مرفق في attachments)؟
[[END]]
