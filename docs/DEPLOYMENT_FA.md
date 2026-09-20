# راه‌اندازی و انتشار رایانش روی Cloudflare Pages

این راهنما برای همین مخزن و نسخهٔ فعلی کد نوشته شده است. تاریخ بررسی مستندات Cloudflare: ۲۰ سپتامبر ۲۰۲۶. نام بعضی گزینه‌های داشبورد ممکن است در آینده جابه‌جا شود.

## ۱. تشخیص مسئلهٔ تصویر ارسالی

در تصویر، `Deploy command = npx wrangler deploy` و `Version command = npx wrangler versions upload` دیده می‌شود. این‌ها تنظیمات **Workers Builds** هستند. خالی بودن Build command نیز برای این پروژه مناسب نیست. بدون لاگ نمی‌توان علت دقیق شکست قبلی را قطعی دانست؛ اما فرم ارسالی فرم Pages نیست. [مرجع Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)

برای اجرای خواستهٔ شما، یک پروژهٔ **Pages** با همین مخزن ایجاد کنید. سایت خروجی HTML/CSS/JS دارد و Worker، adapter کلادفلر، Docker، Django یا سرور Ubuntu نمی‌خواهد. پروژهٔ Worker قبلی را تا زمانی که Pages درست بالا نیامده حذف نکنید. پس از انتقال، اگر هیچ استفادهٔ دیگری ندارد، اتصال انتشار خودکار Worker قبلی را غیرفعال کنید تا ساخت تکراری ایجاد نشود.

## ۲. اتصال مخزن به Pages

۱. وارد حساب درست Cloudflare شوید و از **Workers & Pages → Create application → Pages → Connect to Git** وارد شوید.
۲. GitHub و مخزن `sajjadshendi/rayanesh_website` را انتخاب کنید. اگر مخزن دیده نمی‌شود، دسترسی برنامهٔ Cloudflare در GitHub را فقط برای همین مخزن فعال کنید.
۳. برای نام پروژه یک نام با خط تیره انتخاب کنید، مانند `rayanesh-magazine`؛ زیرخط نام مخزن را لازم نیست در نام پروژه نگه دارید. یکتا بودن نام را خود داشبورد مشخص می‌کند.
۴. شاخهٔ تولید را `main` بگذارید. مخزن خصوصی هم قابل‌استفاده است. [مرجع اتصال Git](https://developers.cloudflare.com/pages/get-started/git-integration/)

## ۳. مقادیر دقیق ساخت

| گزینه | مقدار |
|---|---|
| Framework preset | `Astro` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Root directory | خالی، یعنی ریشهٔ مخزن |
| Production branch | `main` |

اگر پس از انتخاب preset مقدار Build command تغییر کرد، آن را دوباره مطابق جدول تنظیم کنید. مسیر خروجی `public` یا `src` نیست. فایل `package.json` در ریشه قرار دارد. Pages فایل‌های `dist` را منتشر می‌کند؛ `npm run preview` یا `npm run dev` دستور انتشار نیستند. [مرجع تنظیم ساخت](https://developers.cloudflare.com/pages/configuration/build-configuration/)

این متغیرها را در محیط **Production** و **Preview** تنظیم کنید:

| متغیر | مقدار | دلیل |
|---|---|---|
| `NODE_VERSION` | `24.19.0` | هماهنگ با نسخهٔ آزموده‌شدهٔ `.node-version` |
| `SKIP_DEPENDENCY_INSTALL` | `1` | نصب فقط یک بار، با `npm ci` و lockfile انجام شود |
| `ASTRO_TELEMETRY_DISABLED` | `1` | غیرفعال شدن تله‌متری ابزار ساخت |
| `SITE_URL` | نشانی نهایی HTTPS | ساخت canonical، RSS، sitemap و تصویر اشتراک‌گذاری |

برای نمونه، اگر نشانی واقعی پروژه `https://rayanesh-magazine.pages.dev` شد، همین مقدار را قرار دهید. این مثال ادعای رزرو بودن این نام نیست. پس از اتصال دامنهٔ شخصی، `SITE_URL` را به همان دامنه تغییر دهید و دوباره build بگیرید. مقدار فقط مبدأ است؛ مسیر، query، رمز یا توکن در آن قرار ندهید.

Node با `.node-version` نیز مشخص شده است. اگر نسخه را به‌روزرسانی کردید، فایل و متغیر Cloudflare را با هم تغییر دهید. `NODE_ENV=production` یا `NPM_CONFIG_PRODUCTION=true` تنظیم نکنید؛ ابزارهای بررسی در devDependencies قرار دارند. متغیرهای `CF_PAGES*` را دستی تعریف یا بازنویسی نکنید. [مرجع محیط ساخت و نصب وابستگی‌ها](https://developers.cloudflare.com/pages/configuration/build-image/)

هیچ Secret، کلید API یا متغیر دارای پیشوند `PUBLIC_` برای این سایت لازم نیست. اگر `SITE_URL` موقتاً خالی باشد، ساخت Pages از `CF_PAGES_URL` استفاده می‌کند؛ برای نشانی canonical ثابت، مقدار دامنهٔ نهایی را صریحاً تنظیم کنید.

## ۴. اولین انتشار و بررسی آن

**Save and Deploy** را بزنید. در لاگ، این بخش‌ها باید موفق باشند: نصب وابستگی‌ها، `Content validated`، بررسی TypeScript، `output: static` و `Static output verified`. شکست هرکدام باید پیش از انتشار رفع شود.

پس از موفقیت، ابتدا نشانی `pages.dev` را باز کنید. صفحهٔ نخست، یک مقاله، آرشیو، یک PDF، جست‌وجوی «شبکه»، حالت تیره و یک نشانی ناموجود مثل `/not-a-page/` را امتحان کنید. مسیر ناموجود باید صفحهٔ ۴۰۴ و وضعیت HTTP 404 بدهد.

در گوشی، یا حالت نمایش موبایل مرورگر، عرض‌های ۳۲۰، ۳۷۵، ۳۹۰ و ۷۶۸ پیکسل را بررسی کنید: متن اصلی نباید اسکرول افقی داشته باشد؛ کد و جدول باید داخل محدودهٔ خود پیمایش شوند؛ منو نباید روی لوگو یا دکمه‌ها بیفتد. در Safari آیفون و Chrome اندروید نیز یک مقالهٔ بلند و PDF را باز کنید. پشتیبانی از پرش `#page=` در PDF به نمایشگر PDF مرورگر بستگی دارد.

## ۵. اتصال دامنه

از داخل **همان پروژهٔ Pages → Custom domains → Set up a domain** دامنه را اضافه کنید. برای دامنهٔ اصلی مثل `example.com`، دامنه باید zone حساب Cloudflare شما باشد و nameserverهای درست داشته باشد. برای زیردامنه می‌توان CNAME را نزد DNS فعلی به نام پروژهٔ `pages.dev` تنظیم کرد. فقط ساختن CNAME کافی نیست؛ ابتدا دامنه باید به پروژهٔ Pages معرفی شود. [مرجع دامنهٔ اختصاصی](https://developers.cloudflare.com/pages/configuration/custom-domains/)

اگر دامنه اکنون به Worker قبلی متصل است، پس از آزمون موفق `pages.dev`، اتصال آن دامنه به Worker را آزاد و به Pages متصل کنید. این کار ممکن است وقفهٔ کوتاهی داشته باشد؛ تغییر رکوردهای ایمیل و دامنه‌های نامرتبط لازم نیست. تا فعال شدن گواهی HTTPS و وضعیت دامنه صبر کنید. سپس `SITE_URL` را به دامنهٔ اصلی تغییر دهید و انتشار را تکرار کنید.

یک نشانی اصلی انتخاب کنید؛ اگر هر دو `www` و بدون `www` را نگه می‌دارید، دیگری را با Redirect Rule به نشانی اصلی هدایت کنید. هیچ redirect عمومی از همهٔ مسیرها به `/` در این پروژه لازم نیست؛ چنین قانونی لینک مقاله‌ها و ۴۰۴ را خراب می‌کند.

## ۶. انتشار خودکار و GitHub Actions

دو کار جدا انجام می‌شود:

| بخش | وظیفه |
|---|---|
| Cloudflare Git Integration | ساخت و انتشار با تغییر شاخهٔ `main`، پیش‌نمایش شاخه‌های دیگر |
| `.github/workflows/ci.yml` | آزمون‌ها، اعتبارسنجی محتوا و دارایی‌ها، بررسی TypeScript، build، کنترل خروجی و `npm audit` |

در این روش به `CLOUDFLARE_API_TOKEN` یا Action مخصوص deploy نیاز نیست. workflow از مجوز `contents: read` استفاده می‌کند و credential گیت را در runner باقی نمی‌گذارد. Actionها با SHA ثابت مشخص شده‌اند.

روال پیشنهادی تحریریه: شاخهٔ جدید → ویرایش → Pull Request → موفق شدن بررسی `validate` → دیدن Preview → ادغام در `main` → انتشار Pages. **Git Integration به‌طور ذاتی منتظر GitHub Actions نمی‌ماند.** برای گیت اجباری، در صورت پشتیبانی طرح حساب، Ruleset/branch protection شاخهٔ `main` را با الزام Pull Request و بررسی `validate` تنظیم کنید؛ در غیر این صورت این روال را دستی رعایت کنید. برای روتین مقاله‌گذاری لازم نیست مجوز Admin به همه بدهید.

برای کاهش مصرف سهمیه، Preview را فقط برای شاخه‌های تحریریهٔ موردنیاز فعال کنید. پیش‌نمایش مخزن خصوصی ممکن است URL عمومی داشته باشد. `noindex` که سایت برای Preview می‌گذارد رمز عبور نیست؛ برای محتوای حساس، Cloudflare Access یا غیرفعال کردن Preview را در نظر بگیرید. [مرجع پیش‌نمایش‌ها](https://developers.cloudflare.com/pages/configuration/preview-deployments/)

## ۷. خطاهای معمول

| نشانه | بررسی و راه‌حل |
|---|---|
| همچنان `wrangler deploy` اجرا می‌شود | پروژهٔ Worker را باز کرده‌اید؛ پروژهٔ Pages بسازید. |
| `package.json` پیدا نمی‌شود | Root directory باید ریشهٔ همین مخزن باشد. |
| خطای `EBADENGINE` | Node باید با `.node-version` یکسان باشد؛ متغیر قدیمی Cloudflare را اصلاح کنید. |
| ابزار `astro` یا `astro check` پیدا نمی‌شود | از `npm ci` استفاده کنید و نصب devDependencies را غیرفعال نکنید. |
| `npm ci` دربارهٔ lockfile خطا می‌دهد | `npm install` را محلی اجرا کنید و هر دو فایل package و lockfile را با هم کامیت کنید. lockfile را حذف نکنید. |
| `missing author`، `missing issue` یا `out of range` | شناسه‌ها یا شمارهٔ صفحه را مطابق راهنمای محتوا اصلاح کنید. |
| `pdfBytes must equal ...` | حجم دقیق فایل PDF را به بایت در JSON شماره به‌روزرسانی کنید. |
| فایل از ۲۵ MiB بزرگ‌تر است | نسخهٔ سبک‌تر با کنترل کیفیت بسازید یا از پیوند HTTPS میزبان فایل مناسب استفاده کنید. |
| دامنه خطای 522 دارد | دامنه را در Custom domains همان پروژه ثبت کنید و هدف DNS را بررسی کنید. |
| سایت بالا آمده ولی جست‌وجو کار نمی‌کند | از `npm run build` استفاده کنید؛ فایل `/search-index.json` و خطاهای شبکه را بررسی کنید. |
| تغییر جدید دیده نمی‌شود | SHA انتشار Production را با `main` مقایسه کنید؛ لینک Preview را با Production اشتباه نگیرید. |
| stylesheet یا script مسدود شده | محتوای `_headers` و سرویس‌های تزریق اسکریپت مثل Rocket Loader را بررسی کنید؛ CSP را با wildcard باز نکنید. |

برای اعلام خطا، نام مرحله و قسمت مرتبط لاگ را بفرستید. Cookie، Authorization، کلید، ایمیل خصوصی و شناسه‌های حساس را از لاگ حذف کنید.

## ۸. بازگشت و هزینه

برای مشکل فوری می‌توانید یک انتشار موفق قبلی Production را از داشبورد Pages بازگردانید. سپس تغییر معیوب را با `git revert` در مخزن اصلاح کنید؛ rollback داشبورد به‌تنهایی تاریخچهٔ Git را تغییر نمی‌دهد. از force-push و پاک کردن تاریخچه برای اصلاح یک مقاله استفاده نکنید. [مرجع بازگشت انتشار](https://developers.cloudflare.com/pages/configuration/rollbacks/)

در زمان نگارش، طرح Free برای Pages سقف ۵۰۰ build در ماه، ۲۰ هزار فایل و ۲۵ MiB برای هر فایل دارد. این پروژه بدون Functions و سرور برنامه کار می‌کند. ثبت دامنه و سرویس ذخیره‌سازی بیرونی در صورت انتخاب، هزینه و سهمیهٔ مستقل دارند. سهمیهٔ GitHub Actions برای مخزن خصوصی نیز به طرح حساب وابسته است؛ مصرف را در حساب کنترل کنید. [محدودیت‌های Pages](https://developers.cloudflare.com/pages/platform/limits/)
