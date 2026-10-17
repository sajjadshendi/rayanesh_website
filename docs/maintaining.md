# نگهداری رایانش

## اجرای محلی

نسخۀ Node.js در [`.node-version`](../.node-version) مشخص شده است.

```sh
npm ci
npm run dev
```

برای بررسی کامل نسخۀ قابل انتشار:

```sh
SITE_URL=https://sajjadshendi.github.io BASE_PATH=/rayanesh_website/ npm run validate
npm run preview
```

پیش‌نمایش در `http://localhost:4321/rayanesh_website/` در دسترس است. بدون تنظیم متغیرها، مسیر محلی `/` خواهد بود.

## افزودن محتوا

```sh
npm run new -- article article-slug
npm run new -- author author-slug
npm run new -- issue issue-slug
```

قالب‌ها در [`scripts/templates/`](../scripts/templates/) قرار دارند. ابزار، فایل موجود را بازنویسی نمی‌کند؛ مقاله و شماره ابتدا به‌صورت پیش‌نویس ساخته می‌شوند.

- محتوا در [`src/content/`](../src/content/) و انتخاب‌های صفحۀ نخست در [`src/data/site.json`](../src/data/site.json) نگهداری می‌شود.
- نام فایل، شناسه و بخشی از نشانی صفحه است؛ از حروف کوچک انگلیسی و خط تیره استفاده کنید.
- نویسنده و شمارۀ ارجاع‌شده باید موجود باشند. صفحۀ PDF و مقدار `pdfBytes` باید با فایل واقعی تطابق داشته باشند.
- تصاویر باید متن جایگزین داشته باشند. مقاله‌ها با Markdown نوشته می‌شوند؛ HTML خام و تصویر بیرونی پذیرفته نمی‌شود.
- همۀ فایل‌های `public/` در خروجی سایت قرار می‌گیرند، حتی اگر محتوای مرتبط پیش‌نویس باشد.
- پیش از ادغام، `npm run validate` را اجرا و نتیجهٔ بررسی‌های GitHub را کنترل کنید.

## انتشار

گردش‌کار [`deploy-pages.yml`](../.github/workflows/deploy-pages.yml) پس از تغییر `main` یا اجرای دستی از Actions، سایت را می‌سازد و منتشر می‌کند. در تنظیمات Pages، منبع انتشار باید **GitHub Actions** باشد. نشانی و مسیر پایه از تنظیمات Pages خوانده می‌شوند.

گردش‌کار [`ci.yml`](../.github/workflows/ci.yml) مسیر ریشه و زیرمسیر مخزن را بررسی می‌کند. برای تغییر وابستگی‌ها، فایل قفل را نیز ثبت کنید و `npm audit --audit-level=high` را اجرا کنید.
