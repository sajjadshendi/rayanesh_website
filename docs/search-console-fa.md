# راه‌اندازی Google Search Console برای نشریه رایانش

این راهنما در ۱ نوامبر ۲۰۲۶ تهیه شده است. تغییرات این نوبت ابتدا باید منتشر شوند؛ فایل‌های محلی در گوگل قابل بررسی نیستند.

## انتشار

- در GitHub، Settings → Pages، دامنه سفارشی باید rayaneshmag.ir باشد و HTTPS فعال باشد.
- گردش‌کار موجود Deploy to GitHub Pages با push به main اجرا می‌شود. پس از ادغام و ارسال تغییرات، منتظر موفقیت build و deploy بمانید.
- گردش‌کار SITE_URL و BASE_PATH را از تنظیمات Pages دریافت می‌کند؛ برای دامنه اصلی مقدار مورد انتظار https://rayaneshmag.ir و / است.
- https://rayaneshmag.ir/robots.txt باید Allow: / و نشانی sitemap را نشان دهد، نه Disallow: /.
- https://rayaneshmag.ir/sitemap.xml باید نشانی‌های HTTPS دامنه اصلی را داشته باشد. جست‌وجو، ۴۰۴ و پیش‌نویس‌ها نباید در آن باشند.
- تولید محلی بدون SITE_URL عمداً noindex است. بررسی تولید: SITE_URL=https://rayaneshmag.ir و BASE_PATH=/ سپس npm run validate.

## تأیید دامنه

1. وارد https://search.google.com/search-console شوید.
2. از انتخاب‌گر سایت، Add property را انتخاب کنید.
3. نوع Domain را انتخاب و فقط rayaneshmag.ir را وارد کنید؛ بدون https و بدون /.
4. Continue را بزنید و مقدار کامل رکورد TXT با پیشوند google-site-verification= را کپی کنید.
5. نام‌سرورهای فعلی دامنه b.ns.arvancdn.ir و z.ns.arvancdn.ir هستند. در پنل ابر آروان، دامنه rayaneshmag.ir و مدیریت رکوردهای DNS را باز کنید.
6. یک رکورد جدید TXT برای ریشه دامنه بسازید: Name برابر @ (یا دامنه ریشه طبق فرم پنل)، Value برابر مقدار دقیق گوگل، TTL پیش‌فرض/خودکار. هیچ رکورد A، AAAA یا NS را تغییر ندهید.
7. به گوگل برگردید و Verify را بزنید. اگر هنوز پیدا نشد، انتشار DNS را صبر کنید؛ ممکن است تا دو یا سه روز طول بکشد. رکورد را پس از تأیید هم نگه دارید.
8. به‌جای Domain اگر DNS در دسترس نیست، URL prefix برابر https://rayaneshmag.ir/ را اضافه کنید؛ این روش تنها همان پیشوند را پوشش می‌دهد و به روش تأیید دیگری مثل فایل HTML نیاز دارد. کد تأیید را باید از حساب خودتان بگیرید.

## نقشه سایت و درخواست ایندکس

1. در Sitemaps نشانی کامل https://rayaneshmag.ir/sitemap.xml را ثبت کنید. اگر فرم از قبل پیشوند دامنه را دارد فقط sitemap.xml را بنویسید.
2. پس از پردازش، Status باید Success شود. Success به معنی ایندکس شدن همه صفحات نیست.
3. در URL inspection ابتدا https://rayaneshmag.ir/ را وارد کنید، Test live URL و سپس در صورت دسترس‌پذیر بودن Request indexing را بزنید.
4. همین کار را برای /about/، /articles/، /issues/ و یک مقاله مهم انجام دهید. نیازی به ارسال دستی تک‌تک صفحات نیست؛ از sitemap و لینک‌های داخلی کشف می‌شوند.
5. در Rich Results Test، یک مقاله و صفحه‌ای با breadcrumb را بررسی کنید: https://search.google.com/test/rich-results . WebSite و نام سایت الزاماً در این ابزار به‌عنوان rich result نشان داده نمی‌شوند؛ برای بررسی کل اسکیما از https://validator.schema.org استفاده کنید.

## پیگیری

- Pages: خطاهای server error، blocked by robots.txt، redirect error و ۴۰۴ ناخواسته را بررسی کنید. noindex برای /search/ و /404.html عمدی است.
- URL inspection: canonical انتخابی گوگل را با نشانی canonical همین صفحه مقایسه کنید. گزارش اصلی وضعیت آخرین ایندکس است؛ برای بررسی نسخه فعلی Test live URL لازم است.
- Performance → Search results: کلیک، نمایش، CTR و عبارت‌های جست‌وجو را در هفته‌های بعد دنبال کنید.
- Core Web Vitals: برای سایت کم‌بازدید ممکن است هنوز داده کافی وجود نداشته باشد.
- نام ترجیحی در WebSite و og:site_name برابر «نشریه رایانش» است. favicon مربع و قابل خزیدن است. تغییر نمایش در گوگل فوری یا تضمین‌شده نیست.
- برای مقاله جدید، عنوان و توضیح واقعی و مشخص، نویسنده، متن اصلی و تاریخ انتشار واقعی را ثبت کنید. اگر تاریخ دقیق موجود نیست خالی بماند؛ تاریخ ساخت سایت را جایگزین تاریخ مقاله نکنید.

## منابع رسمی

- تأیید مالکیت: https://support.google.com/webmasters/answer/9008080?hl=en
- نقشه سایت: https://support.google.com/webmasters/answer/7451001?hl=en
- بررسی URL: https://support.google.com/webmasters/answer/9012289/
- نام سایت: https://developers.google.com/search/docs/appearance/site-names
- favicon: https://developers.google.com/search/docs/appearance/favicon-in-search
- noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing
