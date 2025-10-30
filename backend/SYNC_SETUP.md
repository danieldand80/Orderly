# 🔄 Order Synchronization Setup Guide

Эта система автоматически синхронизирует заказы из Google Sheets в Supabase базу данных.

---

## 📋 Что делает синхронизация?

1. **UPSERT** - Обновляет существующие заказы или добавляет новые
2. **CLEANUP** - Удаляет заказы старше 4 месяцев
3. **LOGGING** - Подробные логи всех операций

---

## 🛠️ Шаг 1: Обновить схему базы данных

### В Supabase SQL Editor выполните:

```sql
-- Add updated_at field for sync tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on updated_at for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Create index on datetime_of_purchase for faster date range queries
CREATE INDEX IF NOT EXISTS idx_orders_purchase_date ON orders(datetime_of_purchase);

-- Add comment
COMMENT ON COLUMN orders.updated_at IS 'Last time this order was synced from Google Sheets';
```

Этот SQL находится в файле: `backend/database/migrations/001_add_sync_fields.sql`

---

## 🔑 Шаг 2: Добавить переменные окружения

### На Railway добавьте новую переменную:

```bash
SYNC_API_KEY=ваш_секретный_ключ_здесь
```

**Как сгенерировать безопасный ключ:**
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Или используйте любой генератор паролей
```

### Убедитесь, что есть все переменные:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Google Sheets (для трекинга)
GOOGLE_SHEET_ID=1xxx...
GOOGLE_SERVICE_ACCOUNT_JSON={...} или путь к файлу

# Google Sheets (для Product Lookup)
GOOGLE_SHEET_ID_PRODUCTS=1tNqq...

# 17Track API
TRACK17_API_KEY=xxx

# Sync API Key (НОВАЯ!)
SYNC_API_KEY=ваш_секретный_ключ
```

---

## 🧪 Шаг 3: Тестирование синхронизации

### Manual trigger (ручной запуск):

```bash
# С API ключом в заголовке
curl -X POST https://your-app.railway.app/api/sync-orders \
  -H "x-api-key: ваш_секретный_ключ"

# Или с API ключом в query параметре
curl -X POST "https://your-app.railway.app/api/sync-orders?api_key=ваш_секретный_ключ"
```

### Ожидаемый ответ (успех):

```json
{
  "status": "success",
  "message": "Synchronization completed successfully",
  "stats": {
    "fetched": 150,
    "processed": 150,
    "errors": 0,
    "deleted": 5,
    "duration": "3.45s"
  },
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### Проверьте логи на Railway:

```
🔄 ===== STARTING ORDER SYNCHRONIZATION =====
📊 Fetching orders from Google Sheets...
✅ Found 150 rows in Google Sheets
✅ Parsed 150 valid orders
💾 Upserting 150 orders to Supabase...
✅ Processed batch 1/2
✅ Processed batch 2/2
✅ Upsert complete: 150 processed, 0 errors
🧹 Cleaning up old orders (>4 months)...
📅 Deleting orders with updated_at before: 2025-06-30T12:00:00.000Z
✅ Deleted 5 old orders
✅ ===== SYNCHRONIZATION COMPLETE =====
```

---

## ⏰ Шаг 4: Настроить автоматическую синхронизацию (Railway Cron)

### На Railway:

1. **Перейдите в ваш проект**
2. **Settings → Cron Jobs → New Cron Job**
3. **Заполните:**

```
Name: Daily Order Sync
Schedule: 0 3 * * * 
  (каждый день в 3:00 UTC / 6:00 Israel Time)

Command: 
curl -X POST https://your-app.railway.app/api/sync-orders -H "x-api-key: ${SYNC_API_KEY}"
```

### Альтернативные расписания:

```bash
# Каждый день в 3:00 UTC (6:00 Israel)
0 3 * * *

# Каждый день в полночь UTC (3:00 Israel)
0 0 * * *

# Каждые 12 часов
0 */12 * * *

# Каждые 6 часов
0 */6 * * *

# Раз в неделю (воскресенье в 3:00 UTC)
0 3 * * 0
```

**Railway автоматически подставит `${SYNC_API_KEY}` из переменных окружения!**

---

## 📊 Логика синхронизации (UPSERT + Cleanup)

```
Google Sheets (новые данные):
  FLY001 - новый заказ
  FLY002 - обновленный заказ (новый tracking)
  FLY003 - существующий заказ

База данных ДО синхронизации:
  FLY002 - старый tracking
  FLY003 - существует
  FLY999 - очень старый (5 месяцев назад)

База данных ПОСЛЕ синхронизации:
  FLY001 - ✅ добавлен (новый)
  FLY002 - ✅ обновлен (новый tracking)
  FLY003 - ✅ обновлен (updated_at)
  FLY999 - ❌ удален (>4 месяца)
```

---

## 🔐 Безопасность

- ✅ Endpoint защищен API ключом
- ✅ Можно использовать в заголовке `x-api-key` или query параметре `?api_key=`
- ✅ Railway Cron Job использует переменную окружения
- ✅ Логи не показывают API ключ

---

## 🐛 Troubleshooting

### Ошибка: "Unauthorized - Invalid API key"
**Решение:** Проверьте, что `SYNC_API_KEY` правильно указан в Railway

### Ошибка: "GOOGLE_SHEET_ID not configured"
**Решение:** Добавьте `GOOGLE_SHEET_ID` в переменные окружения Railway

### Ошибка: "Unable to parse range: Flylink Data Global"
**Решение:** Проверьте, что лист называется именно "Flylink Data Global" (с пробелами)

### Ошибка: "Failed to fetch orders"
**Решение:** Проверьте права доступа Google Service Account к таблице

### Синхронизация не запускается автоматически
**Решение:** 
1. Проверьте Railway Cron Job настройки
2. Убедитесь, что URL правильный
3. Проверьте логи Railway для Cron Job

---

## 📝 Мониторинг

### Проверить последнюю синхронизацию в Supabase:

```sql
-- Последние обновленные заказы
SELECT order_id, updated_at 
FROM orders 
ORDER BY updated_at DESC 
LIMIT 10;

-- Количество заказов по месяцам
SELECT 
  DATE_TRUNC('month', datetime_of_purchase) as month,
  COUNT(*) as total_orders
FROM orders
GROUP BY month
ORDER BY month DESC;

-- Заказы старше 4 месяцев (будут удалены при следующей синхронизации)
SELECT COUNT(*) as orders_to_delete
FROM orders
WHERE updated_at < NOW() - INTERVAL '4 months';
```

---

## ✅ Готово!

Теперь ваши заказы будут автоматически синхронизироваться каждый день! 🎉

**Поток данных:**
```
Google Sheets → Railway API (POST /api/sync-orders) → Supabase
```

**Хранение:** 4 месяца, потом автоматическое удаление старых заказов.

