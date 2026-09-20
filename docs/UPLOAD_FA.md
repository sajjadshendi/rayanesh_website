# انتقال نسخهٔ آماده به GitHub، بدون تکرار پیاده‌سازی

این بسته، سورس کامل سایت، PDFهای مناسب وب، تصاویر، راهنماها و GitHub Actions را دارد. فایل‌های وابستگی `node_modules` و خروجی موقت `dist` عمداً داخل بسته نیستند. این فایل‌ها با `npm ci` و build ساخته می‌شوند.

## روش پیشنهادی: GitHub Desktop

۱. GitHub Desktop را از سایت رسمی https://desktop.github.com/ نصب کنید و با حساب دارای دسترسی مخزن وارد شوید.
۲. از File → Clone repository → URL، مخزن `https://github.com/sajjadshendi/rayanesh_website` را clone کنید. اگر قبلاً clone کرده‌اید، Fetch origin و سپس Pull origin را انجام دهید.
۳. فایل ZIP را استخراج کنید. **محتویات داخل پوشهٔ `rayanesh_website`** را در ریشهٔ clone کپی کنید؛ فایل `package.json` باید کنار README قرار بگیرد، نه در یک زیرپوشهٔ اضافی. جایگزینی README اولیه لازم است. پوشهٔ `.git` مخزن را حذف یا جایگزین نکنید.
۴. انتقال پوشهٔ `.github` و فایل‌های `.node-version`، `.npmrc`، `.gitignore` و `.env.example` را نیز بررسی کنید. بسته هیچ رمز یا کلید خصوصی لازم ندارد.
۵. در GitHub Desktop، نام فایل‌های Changes را ببینید. نباید `node_modules`، `dist`، فایل `.env` واقعی یا دادهٔ خصوصی در فهرست باشد. همهٔ فایل‌های بسته، از جمله `public/downloads`، باید وارد شوند.
۶. در Summary بنویسید `Build Rayanesh static magazine for Cloudflare Pages`، سپس Commit to main و Push origin را بزنید. اگر مخزن نیاز به Pull Request دارد، همین تغییرها را در شاخهٔ جدید push و PR ایجاد کنید؛ محدودیت مخزن را غیرفعال نکنید.
۷. در GitHub → Actions، اجرای `Validate magazine` را بررسی کنید. پس از موفقیت، تنظیمات Pages را طبق `DEPLOYMENT_FA.md` اعمال کنید.

حداکثر اندازهٔ هر PDF این بسته کمتر از ۲۵ MiB است. بهتر است از بارگذاری دستی مرورگری تعداد زیاد فایل‌ها استفاده نکنید؛ GitHub Desktop پوشه‌ها و فایل‌های پنهان را کامل منتقل می‌کند.

## اگر Git خط فرمان دارید

```bash
git clone https://github.com/sajjadshendi/rayanesh_website.git
cd rayanesh_website
```

اکنون محتوای پوشهٔ داخل ZIP را در همین clone کپی کنید؛ سپس:

```bash
git status --short
npm ci
npm run validate
git add .
git diff --cached --stat
git commit -m "Build Rayanesh static magazine for Cloudflare Pages"
git push origin main
```

Node باید مطابق `.node-version` باشد. احراز هویت را با روش عادی GitHub انجام دهید؛ توکن را داخل فایل یا URL مخزن نگذارید. اگر push به دلیل تغییر جدید مخزن رد شد، ابتدا تغییرهای تازه را دریافت و بررسی کنید؛ `--force` استفاده نکنید.

## تنظیمات Cloudflare در یک نگاه

پروژه از نوع Pages، شاخهٔ تولید `main`، preset برابر Astro، فرمان build برابر `npm ci && npm run build`، خروجی `dist` و Root directory خالی باشد. `NODE_VERSION=24.19.0`، `SKIP_DEPENDENCY_INSTALL=1`، `ASTRO_TELEMETRY_DISABLED=1` و `SITE_URL` با نشانی واقعی HTTPS سایت تنظیم شوند. فرم دارای `wrangler deploy` مربوط به Workers است؛ مسیر Pages را انتخاب کنید.

## وضعیت بررسی این نسخه

ساخت ۳۱ صفحهٔ ایستا، پنج آزمون محتوا و امنیت، کنترل TypeScript، لینک‌های داخلی و اندازهٔ فایل‌ها موفق بوده‌اند. ممیزی وابستگی‌ها در زمان آماده‌سازی هیچ آسیب‌پذیری شناخته‌شده گزارش نکرد. بررسی بصری در مرورگر این محیط به دلیل مسدود بودن localhost انجام نشد؛ آزمون گوشی و محیط زنده را مطابق راهنمای انتشار انجام دهید. ثبت کامیت و وضعیت واقعی انتشار را پس از Push در حساب خود بررسی کنید.
