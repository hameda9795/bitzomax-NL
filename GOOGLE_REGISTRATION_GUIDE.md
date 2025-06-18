# راهنمای ثبت سایت Bitzomax در Google

## مراحل انجام شده:
✅ فایل sitemap.xml موجود است
✅ فایل robots.txt موجود است  
✅ Meta tags برای SEO در index.html موجود است
✅ فایل تایید Google ایجاد شد

## مراحل باقی‌مانده:

### 1. Google Search Console
1. به https://search.google.com/search-console بروید
2. با اکانت Google وارد شوید
3. روی "Add Property" کلیک کنید
4. آدرس https://bitzomax.nl را وارد کنید
5. یکی از روش‌های تایید را انتخاب کنید:
   - **HTML File**: فایل ارائه شده توسط Google را در پوشه public قرار دهید
   - **HTML Tag**: کد verification را در فایل index.html قرار دهید
   - **Domain Name Provider**: از طریق DNS تایید کنید

### 2. ثبت Sitemap
بعد از تایید مالکیت:
1. در Search Console به بخش "Sitemaps" بروید
2. آدرس sitemap را اضافه کنید: `https://bitzomax.nl/sitemap.xml`
3. روی "Submit" کلیک کنید

### 3. Google Analytics (اختیاری)
1. به https://analytics.google.com بروید
2. یک property جدید ایجاد کنید
3. کد tracking را در فایل index.html اضافه کنید

### 4. بررسی Performance
- از ابزار PageSpeed Insights استفاده کنید: https://pagespeed.web.dev/
- سرعت لودینگ سایت را بهبود دهید

### 5. تست کردن
- Robot.txt را تست کنید: https://www.google.com/webmasters/tools/robots-testing-tool
- Structured Data را تست کنید: https://search.google.com/test/rich-results

## نکات مهم:
- صبر کنید تا Google سایت شما را index کند (معمولاً 1-2 هفته)
- محتوای با کیفیت و منظم publish کنید
- از کلمات کلیدی مناسب استفاده کنید
- سایت را mobile-friendly نگه دارید

## فایل‌های مهم:
- `/sitemap.xml` - نقشه سایت
- `/robots.txt` - دستورالعمل برای crawlerها
- `/google-site-verification.html` - تایید مالکیت Google
