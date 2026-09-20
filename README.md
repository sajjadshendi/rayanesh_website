# رایانش

وب‌سایت فارسی نشریهٔ علمی و فرهنگی رایانش؛ ساخته‌شده با **Astro، TypeScript و Markdown** و خروجی کاملاً استاتیک برای **Cloudflare Pages**.

## شروع انتشار

در Cloudflare یک پروژهٔ **Pages** از مخزن `sajjadshendi/rayanesh_website` بسازید:

| تنظیم | مقدار |
|---|---|
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Root directory | خالی؛ ریشهٔ مخزن |
| `NODE_VERSION` | `24.19.0` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| `SITE_URL` | نشانی واقعی سایت، مانند `https://your-project.pages.dev` |
| `ASTRO_TELEMETRY_DISABLED` | `1` |

**صفحه‌ای که `Deploy command: npx wrangler deploy` و `Version command` دارد، مربوط به Workers است.** برای این پروژه مسیر Pages را انتخاب کنید؛ دستور Deploy یا فایل Wrangler لازم نیست. تنظیمات کامل، دامنه و رفع خطا: [DEPLOYMENT_FA.md](docs/DEPLOYMENT_FA.md).

## راهنماها

- [انتقال بستهٔ آماده به GitHub، بدون تکرار پیاده‌سازی](docs/UPLOAD_FA.md)

- [راه‌اندازی Cloudflare Pages، دامنه، انتشار خودکار و رفع خطا](docs/DEPLOYMENT_FA.md)
- [افزودن و ویرایش نوشته، نویسنده، شماره، PDF، صوت و صفحهٔ نخست](docs/CONTENT_FA.md)
- [امنیت کد، حساب‌ها، انتشار و نگهداری](SECURITY.md)
- [ساختار فنی و تصمیم‌های طراحی](docs/ARCHITECTURE_FA.md)
- [منبع محتوای اولیه و وضعیت انتقال آرشیو](docs/CONTENT_SOURCES_FA.md)
- [اعتبار و مجوز وابستگی‌ها](THIRD_PARTY_NOTICES.md)

## اجرای محلی

Node مطابق `.node-version` و Git را نصب کنید. در ترمینال:

```bash
git clone https://github.com/sajjadshendi/rayanesh_website.git
cd rayanesh_website
npm ci
npm run dev
```

نشانی محلی: `http://localhost:4321`. برای بررسی نسخهٔ نهایی:

```bash
npm run validate
npm run preview
```

برای این کار به رمز Cloudflare، API Token یا فایل `.env` نیاز نیست. اگر `SITE_URL` تنظیم نشده باشد، نسخهٔ محلی `noindex` است و canonical ندارد. تنظیم دامنه در محیط ساخت انجام می‌شود.

## امکانات این نسخه

طراحی راست‌به‌چپ و واکنش‌گرا، آرشیو PDF و جلدها، فهرست هر شماره، صفحهٔ مقاله و نویسنده، موضوع‌ها، جست‌وجوی فارسی در مرورگر، حالت روشن/تیره، اندازهٔ متن، هم‌رسانی، فرمول، کد، جدول، پانویس، شعر، صوت اختیاری، RSS و sitemap.

۱۰ فایل شماره و ویژه‌نامه در آرشیو قرار گرفته‌اند. پنج نوشته و چهار نویسنده برای شروع به وب منتقل شده‌اند؛ چهار نوشته متن کامل و یک نوشته گزیده است. همهٔ مقاله‌های همهٔ PDFها هنوز به متن وب تبدیل نشده‌اند. ادامهٔ ورود محتوا از طریق راهنمای تحریریه انجام می‌شود.

سرور برنامه، پایگاه داده، پنل ورود عمومی، Functions و درخواست به مدل هوش مصنوعی در زمان اجرای سایت وجود ندارد. مدیریت انتشار از GitHub انجام می‌شود.

## انتشار خودکار و کیفیت

Cloudflare Git Integration پس از هر تغییر `main` می‌سازد و منتشر می‌کند. workflow `Validate magazine` در GitHub Actions آزمون امنیت محتوای Markdown و جست‌وجو، صحت داده‌ها، TypeScript، build، لینک‌های داخلی، عدم انتشار draft و محدودیت فایل‌های Pages را بررسی می‌کند. Dependabot پیشنهادهای به‌روزرسانی می‌سازد؛ ادغام خودکار فعال نشده است.

**CI گیت‌هاب به‌تنهایی جلوی انتشار Cloudflare را نمی‌گیرد.** برای الزام گذراندن CI پیش از انتشار، تغییرها را در Pull Request بررسی و در صورت پشتیبانی طرح GitHub، بررسی `validate` را برای `main` اجباری کنید. خود فرمان `npm run build` نیز اعتبارسنجی داده‌ها و خروجی را انجام می‌دهد.
