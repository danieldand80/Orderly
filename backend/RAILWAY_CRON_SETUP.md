# ⏰ Railway Cron Job Setup - Автоматическая синхронизация

Пошаговая инструкция по настройке автоматической ежедневной синхронизации заказов.

---

## 🔑 Шаг 1: Добавить SYNC_API_KEY в Railway

### 1.1 Сгенерировать безопасный API ключ

**На Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**На Linux/Mac:**
```bash
openssl rand -hex 32
```

**Или используйте онлайн генератор:**
- https://randomkeygen.com/ (выберите "CodeIgniter Encryption Keys")

### 1.2 Добавить в Railway

1. Откройте https://railway.app/dashboard
2. Выберите ваш проект
3. Перейдите в **Variables**
4. Нажмите **New Variable**
5. Добавьте:
   ```
   Name: SYNC_API_KEY
   Value: ваш_сгенерированный_ключ
   ```
6. Нажмите **Add**

### 1.3 Проверить остальные переменные

Убедитесь, что есть все переменные:
```
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ GOOGLE_SHEET_ID
✅ GOOGLE_SHEET_ID_PRODUCTS
✅ GOOGLE_SERVICE_ACCOUNT_JSON
✅ TRACK17_API_KEY
✅ SYNC_API_KEY (НОВАЯ!)
```

---

## 🗄️ Шаг 2: Обновить схему Supabase

### 2.1 Открыть Supabase SQL Editor

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Нажмите **New Query**

### 2.2 Выполнить SQL миграцию

Скопируйте и выполните:

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

3. Нажмите **Run** (или Ctrl+Enter)
4. Дождитесь сообщения: `Success. No rows returned`

---

## 🧪 Шаг 3: Тестировать endpoint (Manual Sync)

### 3.1 Получить URL вашего приложения

На Railway:
1. Перейдите в **Settings → Domains**
2. Скопируйте URL (например: `https://your-app.up.railway.app`)

### 3.2 Тестовый запрос

**На Windows PowerShell:**
```powershell
$headers = @{
    "x-api-key" = "ваш_SYNC_API_KEY"
}

Invoke-RestMethod -Uri "https://your-app.up.railway.app/api/sync-orders" -Method POST -Headers $headers
```

**На Linux/Mac или Git Bash:**
```bash
curl -X POST https://your-app.up.railway.app/api/sync-orders \
  -H "x-api-key: ваш_SYNC_API_KEY"
```

### 3.3 Ожидаемый ответ

**Успех:**
```json
{
  "status": "success",
  "message": "Synchronization completed successfully",
  "stats": {
    "fetched": 150,
    "processed": 150,
    "errors": 0,
    "deleted": 3,
    "duration": "4.12s"
  },
  "timestamp": "2025-10-30T12:34:56.789Z"
}
```

**Ошибка (неверный API ключ):**
```json
{
  "status": "error",
  "message": "Unauthorized - Invalid API key"
}
```

### 3.4 Проверить логи на Railway

1. Откройте **Deployments → Latest → View Logs**
2. Найдите:
```
🔄 ===== STARTING ORDER SYNCHRONIZATION =====
📊 Fetching orders from Google Sheets...
✅ Found 150 rows in Google Sheets
💾 Upserting 150 orders to Supabase...
✅ Upsert complete: 150 processed, 0 errors
🧹 Cleaning up old orders (>4 months)...
✅ Deleted 3 old orders
✅ ===== SYNCHRONIZATION COMPLETE =====
```

---

## ⏰ Шаг 4: Настроить Cron Job на Railway

### 4.1 Открыть Cron Jobs

1. На Railway Dashboard выберите ваш проект
2. Нажмите **+ New** → **Cron Job**

### 4.2 Настроить Cron Job

**Заполните форму:**

```
Name: Daily Order Sync
Description: Syncs orders from Google Sheets to Supabase daily at 3 AM UTC
```

**Schedule (Cron Expression):**
```
0 3 * * *
```
> Это означает: каждый день в 3:00 UTC (6:00 Israel Time)

**Command:**
```bash
curl -X POST ${{RAILWAY_PUBLIC_DOMAIN}}/api/sync-orders -H "x-api-key: ${{SYNC_API_KEY}}"
```

> Railway автоматически подставит переменные окружения!

**Timezone:** `UTC`

### 4.3 Альтернативные расписания

Выберите подходящее:

```bash
# Каждый день в 3:00 UTC (6:00 Israel)
0 3 * * *

# Каждый день в полночь UTC (3:00 Israel)
0 0 * * *

# Два раза в день (3:00 и 15:00 UTC)
0 3,15 * * *

# Каждые 12 часов
0 */12 * * *

# Каждые 6 часов
0 */6 * * *

# Раз в неделю (воскресенье в 3:00 UTC)
0 3 * * 0
```

### 4.4 Сохранить и активировать

1. Нажмите **Create Cron Job**
2. Cron Job появится в списке
3. Проверьте статус: должен быть **Active**

---

## 📊 Шаг 5: Мониторинг и проверка

### 5.1 Проверить выполнение Cron Job

**На Railway:**
1. Откройте Cron Job
2. Перейдите во вкладку **Logs**
3. После первого запуска (следующий день в 3:00 UTC) проверьте логи

### 5.2 Проверить данные в Supabase

**SQL запросы для проверки:**

```sql
-- Последние синхронизированные заказы
SELECT order_id, tracking_number, updated_at 
FROM orders 
ORDER BY updated_at DESC 
LIMIT 20;

-- Общее количество заказов
SELECT COUNT(*) as total_orders FROM orders;

-- Заказы по месяцам
SELECT 
  DATE_TRUNC('month', datetime_of_purchase) as month,
  COUNT(*) as count
FROM orders
GROUP BY month
ORDER BY month DESC;

-- Заказы, которые будут удалены при следующей синхронизации (>4 месяца)
SELECT 
  order_id, 
  updated_at,
  AGE(NOW(), updated_at) as age
FROM orders
WHERE updated_at < NOW() - INTERVAL '4 months'
ORDER BY updated_at DESC;
```

### 5.3 Принудительный запуск (Manual Trigger)

Если хотите запустить синхронизацию прямо сейчас (не дожидаясь Cron):

```bash
curl -X POST https://your-app.up.railway.app/api/sync-orders \
  -H "x-api-key: ваш_SYNC_API_KEY"
```

---

## 🔧 Troubleshooting

### ❌ Cron Job не выполняется

**Проверьте:**
1. Railway Cron Job статус: должен быть **Active**
2. Переменная `SYNC_API_KEY` правильно указана
3. Логи Railway на наличие ошибок

**Решение:**
- Попробуйте удалить и создать Cron Job заново
- Проверьте, что приложение развернуто и работает

### ❌ Ошибка "Unauthorized"

**Причина:** Неверный или отсутствующий `SYNC_API_KEY`

**Решение:**
1. Проверьте переменную `SYNC_API_KEY` в Railway Variables
2. Убедитесь, что в Cron Job команде используется `${{SYNC_API_KEY}}`

### ❌ Ошибка "Unable to parse range"

**Причина:** Неверное название листа в Google Sheets

**Решение:**
- Убедитесь, что лист называется **"Flylink Data Global"** (с пробелами)
- Проверьте права доступа Google Service Account

### ❌ Не удаляются старые заказы

**Причина:** Поле `updated_at` не было добавлено в схему БД

**Решение:**
- Выполните SQL миграцию из Шага 2
- Запустите синхронизацию еще раз (все записи получат `updated_at`)

---

## ✅ Готово!

Теперь ваша система автоматически:
- ✅ Синхронизирует заказы каждый день в 3:00 UTC
- ✅ Обновляет существующие заказы
- ✅ Добавляет новые заказы
- ✅ Удаляет заказы старше 4 месяцев

**Поток данных:**
```
Google Sheets → Railway Cron (3:00 UTC daily) → API /api/sync-orders → Supabase
```

---

## 📝 Дополнительные возможности

### Webhook для мгновенной синхронизации

Если нужно синхронизировать сразу после обновления Google Sheets:

1. Используйте Google Apps Script
2. При изменении таблицы вызывайте:
```javascript
function onEdit() {
  UrlFetchApp.fetch('https://your-app.up.railway.app/api/sync-orders', {
    method: 'POST',
    headers: {
      'x-api-key': 'ваш_SYNC_API_KEY'
    }
  });
}
```

### Email уведомления

Добавьте email уведомления при ошибках синхронизации:
- Используйте Railway Notifications
- Или добавьте SendGrid/Mailgun в код `syncOrders.js`

---

Если есть вопросы, проверьте `SYNC_SETUP.md` для подробностей! 🚀

