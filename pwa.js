(function () {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    let installPrompt = null;
    let installBanner = null;

    function createInstallBanner() {
        if (installBanner || isStandalone || sessionStorage.getItem('bayanInstallBannerDismissed') === 'true') return;

        installBanner = document.createElement('aside');
        installBanner.setAttribute('dir', 'rtl');
        installBanner.setAttribute('aria-label', 'تثبيت تطبيق أكاديمية بيان');
        installBanner.style.cssText = 'position:fixed;z-index:60;left:16px;right:16px;bottom:16px;max-width:520px;margin:auto;padding:16px;border:1px solid #d1fae5;border-radius:20px;background:#fff;box-shadow:0 16px 40px rgba(2,44,34,.2);font-family:Cairo,Arial,sans-serif;color:#0f172a';

        const instructions = isIOS
            ? 'لتثبيت بيان على iPhone أو iPad: اضغط زر المشاركة في Safari، ثم اختر «إضافة إلى الشاشة الرئيسية».'
            : 'ثبّت بيان على شاشة هاتفك للوصول السريع إلى الدروس والجدول.';
        const actionText = isIOS ? 'طريقة التثبيت' : 'تثبيت التطبيق';

        installBanner.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px">
                <div aria-hidden="true" style="width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:13px;background:#ecfdf5;color:#047857;font-size:20px">ب</div>
                <div style="flex:1;min-width:0">
                    <p style="margin:0;font-size:14px;font-weight:800">ثبّت تطبيق أكاديمية بيان</p>
                    <p style="margin:4px 0 12px;font-size:12px;line-height:1.7;color:#64748b">${instructions}</p>
                    <div style="display:flex;align-items:center;gap:8px">
                        <button type="button" data-install-app style="border:0;border-radius:11px;background:#065f46;color:#fff;padding:9px 14px;font:700 12px Cairo,Arial,sans-serif;cursor:pointer">${actionText}</button>
                        <button type="button" data-dismiss-install style="border:0;border-radius:11px;background:#f1f5f9;color:#475569;padding:9px 14px;font:700 12px Cairo,Arial,sans-serif;cursor:pointer">لاحقاً</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(installBanner);

        installBanner.querySelector('[data-install-app]').addEventListener('click', async function () {
            if (!installPrompt) {
                if (!isIOS) {
                    window.alert('من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».');
                }
                return;
            }

            installPrompt.prompt();
            const choice = await installPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                installBanner.remove();
                installBanner = null;
            }
            installPrompt = null;
        });

        installBanner.querySelector('[data-dismiss-install]').addEventListener('click', function () {
            sessionStorage.setItem('bayanInstallBannerDismissed', 'true');
            installBanner.remove();
            installBanner = null;
        });
    }

    if ('serviceWorker' in navigator) {
        const serviceWorkerUrl = new URL('firebase-messaging-sw.js', document.currentScript.src);
        navigator.serviceWorker.register(serviceWorkerUrl.href)
            .catch(function (error) {
                console.error('تعذر تسجيل خدمة تطبيق أكاديمية بيان:', error);
            });
    }

    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        installPrompt = event;
        createInstallBanner();
    });

    window.addEventListener('appinstalled', function () {
        if (installBanner) installBanner.remove();
        installBanner = null;
        installPrompt = null;
    });

    if (isIOS && !isStandalone) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createInstallBanner, { once: true });
        } else {
            createInstallBanner();
        }
    }
})();
