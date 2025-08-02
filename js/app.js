// التطبيق الرئيسي
class LandSalesApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    // تهيئة التطبيق
    init() {
        this.setupEventListeners();
        this.checkLogin();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // إغلاق التنبيهات تلقائياً
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                if (alert.classList.contains('auto-dismiss')) {
                    alert.remove();
                }
            });
        }, 5000);
    }

    // تسجيل الدخول
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = db.getAll('users');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.showMainApp();
            this.showAlert('تم تسجيل الدخول بنجاح', 'success');
        } else {
            this.showAlert('اسم المستخدم أو كلمة المرور غير صحيحة', 'danger');
        }
    }

    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.showLoginScreen();
        this.showAlert('تم تسجيل الخروج بنجاح', 'info');
    }

    // فحص حالة تسجيل الدخول
    checkLogin() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    // عرض شاشة تسجيل الدخول
    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('d-none');
        document.getElementById('mainApp').classList.add('d-none');
    }

    // عرض التطبيق الرئيسي
    showMainApp() {
        document.getElementById('loginScreen').classList.add('d-none');
        document.getElementById('mainApp').classList.remove('d-none');
        this.showSection('dashboard');
    }

    // عرض قسم معين
    showSection(sectionName) {
        // إخفاء جميع الأقسام
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // إزالة الفئة النشطة من جميع روابط القائمة
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // عرض القسم المطلوب
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;

            // تفعيل الرابط في القائمة
            const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // تحميل محتوى القسم
            this.loadSectionContent(sectionName);
        }
    }

    // تحميل محتوى القسم
    loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                dashboardManager.render();
                break;
            case 'lands':
                landsManager.render();
                break;
            case 'plots':
                plotsManager.render();
                break;
            case 'customers':
                customersManager.render();
                break;
            case 'sales':
                salesManager.render();
                break;
            case 'expenses':
                expensesManager.render();
                break;
            case 'reports':
                reportsManager.render();
                break;
            case 'maps':
                mapsManager.render();
                break;
        }
    }

    // عرض تنبيه
    showAlert(message, type = 'info', autoClose = true) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show ${autoClose ? 'auto-dismiss' : ''}`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // إضافة التنبيه في أعلى المحتوى
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }

        // إزالة التنبيه تلقائياً
        if (autoClose) {
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }

    // تأكيد الحذف
    confirmDelete(message = 'هل أنت متأكد من الحذف؟') {
        return confirm(message);
    }

    // تنسيق الأرقام
    formatNumber(number) {
        return new Intl.NumberFormat('ar-SA').format(number);
    }

    // تنسيق العملة
    formatCurrency(amount) {
        return `${this.formatNumber(amount)} ريال`;
    }

    // تنسيق التاريخ
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    // تنسيق التاريخ والوقت
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA');
    }

    // فتح مودال
    openModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();
    }

    // إغلاق مودال
    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('dataModal'));
        if (modal) {
            modal.hide();
        }
    }

    // تصدير البيانات
    exportData() {
        const data = db.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `land_sales_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showAlert('تم تصدير البيانات بنجاح', 'success');
    }

    // استيراد البيانات
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = db.importData(e.target.result);
                if (success) {
                    this.showAlert('تم استيراد البيانات بنجاح', 'success');
                    this.loadSectionContent(this.currentSection);
                } else {
                    this.showAlert('فشل في استيراد البيانات', 'danger');
                }
            } catch (error) {
                this.showAlert('خطأ في تنسيق الملف', 'danger');
            }
        };
        reader.readAsText(file);
    }

    // طباعة التقرير
    printReport(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>تقرير - نظام إدارة بيع الأراضي</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Cairo', sans-serif; direction: rtl; }
                        @media print { .no-print { display: none !important; } }
                    </style>
                </head>
                <body>
                    <div class="container-fluid p-4">
                        ${element.innerHTML}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }
}

// إنشاء مثيل من التطبيق
const app = new LandSalesApp();

// وظائف عامة للاستخدام في HTML
function showSection(sectionName) {
    app.showSection(sectionName);
}

function logout() {
    app.logout();
}

function exportData() {
    app.exportData();
}

function importData(input) {
    const file = input.files[0];
    if (file) {
        app.importData(file);
    }
}
