<div align="center">
  <img src="public/images/rayanesh-logo.png" alt="رایانش" width="160" />
  <h1>رایانش</h1>
  <p>نشریۀ علمی و فرهنگی دانشکدۀ مهندسی کامپیوتر دانشگاه صنعتی شریف</p>
  <p>
    <a href="https://sajjadshendi.github.io/rayanesh_website/">مشاهدۀ سایت</a> ·
    <a href="https://sajjadshendi.github.io/rayanesh_website/issues/">آرشیو شماره‌ها</a> ·
    <a href="https://sajjadshendi.github.io/rayanesh_website/authors/">نویسندگان</a>
  </p>
</div>

رایانش خانه‌ای برای روایت، علم و فرهنگ است. این مخزن شامل وب‌سایت، نوشته‌ها و آرشیو نشریه است؛ با امکان خواندن مقاله‌ها، جست‌وجو و دریافت نسخۀ PDF شماره‌ها.

### ساختار مخزن

| مسیر | محتوا |
| --- | --- |
| [`src/content/`](src/content/) | مقاله‌ها، نویسندگان و اطلاعات شماره‌ها |
| [`src/data/`](src/data/) | اطلاعات و انتخاب‌های صفحۀ نخست |
| [`src/pages/`](src/pages/) | صفحه‌ها، جست‌وجو و خوراک‌ها |
| [`src/components/`](src/components/) و [`src/layouts/`](src/layouts/) | اجزای رابط و قالب اصلی |
| [`src/styles/`](src/styles/) و [`src/scripts/`](src/scripts/) | ظاهر و رفتار سایت |
| [`src/lib/`](src/lib/) | منطق مشترک و قواعد محتوا |
| [`public/`](public/) | تصاویر، جلدها و فایل‌های PDF |
| [`scripts/`](scripts/) و [`tests/`](tests/) | ابزارهای محتوا و بررسی کیفیت |

سایت با **Astro** ساخته می‌شود و پس از موفقیت بررسی‌ها، تغییرات شاخۀ `main` به‌صورت خودکار روی **GitHub Pages** منتشر می‌شوند.

[راهنمای نگهداری و افزودن محتوا](docs/maintaining.md) · [گزارش اشکال در محتوا](https://github.com/sajjadshendi/rayanesh_website/issues/new?template=content_correction.md) · [امنیت](.github/SECURITY.md)

حقوق نوشته‌ها، تصاویر و فایل‌های نشریه برای صاحبان آن‌ها محفوظ است. برای مجوز وابستگی‌ها و فونت‌ها، [اطلاعات حقوقی](THIRD_PARTY_NOTICES.md) را ببینید.
