// الميزات المتقدمة والتحسينات
class AdvancedFeatures {
    constructor() {
        this.backupInterval = null;
        this.notifications = [];
    }

    // نظام النسخ الاحتياطي التلقائي
    enableAutoBackup(intervalMinutes = 30) {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }

        this.backupInterval = setInterval(() => {
            this.createAutoBackup();
        }, intervalMinutes * 60 * 1000);

        app.showAlert(`تم تفعيل النسخ الاحتياطي التلقائي كل ${intervalMinutes} دقيقة`, 'success');
    }

    // إنشاء نسخة احتياطية تلقائية
    createAutoBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            data: {
                lands: db.getAll('lands'),
                plots: db.getAll('plots'),
                customers: db.getAll('customers'),
                sales: db.getAll('sales'),
                payments: db.getAll('payments'),
                expenses: db.getAll('expenses')
            }
        };

        // حفظ النسخة الاحتياطية في LocalStorage
        const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
        backups.push(backupData);

        // الاحتفاظ بآخر 10 نسخ فقط
        if (backups.length > 10) {
            backups.splice(0, backups.length - 10);
        }

        localStorage.setItem('autoBackups', JSON.stringify(backups));
        console.log('تم إنشاء نسخة احتياطية تلقائية:', new Date().toLocaleString('ar-SA'));
    }

    // عرض النسخ الاحتياطية
    showBackupManager() {
        const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
        
        const backupHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h6>إدارة النسخ الاحتياطية</h6>
                    
                    <div class="mb-3">
                        <button class="btn btn-primary" onclick="advancedFeatures.createManualBackup()">
                            <i class="fas fa-save"></i>
                            إنشاء نسخة احتياطية يدوية
                        </button>
                        <button class="btn btn-success" onclick="advancedFeatures.enableAutoBackup(30)">
                            <i class="fas fa-clock"></i>
                            تفعيل النسخ التلقائي
                        </button>
                    </div>
                    
                    ${backups.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>التاريخ والوقت</th>
                                        <th>حجم البيانات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${backups.reverse().map((backup, index) => `
                                        <tr>
                                            <td>${app.formatDateTime(backup.timestamp)}</td>
                                            <td>${this.calculateDataSize(backup.data)} عنصر</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary" onclick="advancedFeatures.restoreBackup(${backups.length - 1 - index})">
                                                    <i class="fas fa-undo"></i>
                                                    استعادة
                                                </button>
                                                <button class="btn btn-sm btn-outline-success" onclick="advancedFeatures.downloadBackup(${backups.length - 1 - index})">
                                                    <i class="fas fa-download"></i>
                                                    تحميل
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">لا توجد نسخ احتياطية</p>'}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
            </div>
        `;

        app.openModal('إدارة النسخ الاحتياطية', backupHTML);
    }

    // إنشاء نسخة احتياطية يدوية
    createManualBackup() {
        this.createAutoBackup();
        app.showAlert('تم إنشاء نسخة احتياطية يدوية بنجاح', 'success');
        this.showBackupManager();
    }

    // استعادة نسخة احتياطية
    restoreBackup(index) {
        if (!app.confirmDelete('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
            return;
        }

        const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
        if (backups[index]) {
            const backupData = backups[index].data;
            
            // استعادة البيانات
            Object.keys(backupData).forEach(table => {
                localStorage.setItem(table, JSON.stringify(backupData[table]));
            });

            app.closeModal();
            app.showAlert('تم استعادة النسخة الاحتياطية بنجاح', 'success');
            
            // إعادة تحميل الصفحة الحالية
            app.loadSectionContent(app.currentSection);
        }
    }

    // تحميل نسخة احتياطية
    downloadBackup(index) {
        const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
        if (backups[index]) {
            const backup = backups[index];
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_${backup.timestamp.split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // حساب حجم البيانات
    calculateDataSize(data) {
        let total = 0;
        Object.values(data).forEach(table => {
            total += table.length;
        });
        return total;
    }

    // نظام التنبيهات المتقدم
    addNotification(title, message, type = 'info', autoClose = true) {
        const notification = {
            id: Date.now(),
            title: title,
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // الاحتفاظ بآخر 50 تنبيه فقط
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        this.updateNotificationBadge();

        if (autoClose) {
            this.showToast(notification);
        }
    }

    // عرض التنبيه المنبثق
    showToast(notification) {
        const toastHTML = `
            <div class="toast align-items-center text-white bg-${notification.type} border-0" role="alert" style="position: fixed; top: 20px; left: 20px; z-index: 9999;">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${notification.title}</strong><br>
                        ${notification.message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        const toastElement = document.createElement('div');
        toastElement.innerHTML = toastHTML;
        document.body.appendChild(toastElement);

        const toast = new bootstrap.Toast(toastElement.querySelector('.toast'));
        toast.show();

        // إزالة العنصر بعد الإغلاق
        toastElement.querySelector('.toast').addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toastElement);
        });
    }

    // تحديث شارة التنبيهات
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // عرض مركز التنبيهات
    showNotificationCenter() {
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        const notificationsHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>مركز التنبيهات</h6>
                        <button class="btn btn-sm btn-outline-secondary" onclick="advancedFeatures.markAllAsRead()">
                            تحديد الكل كمقروء
                        </button>
                    </div>
                    
                    ${this.notifications.length > 0 ? `
                        <div class="list-group" style="max-height: 400px; overflow-y: auto;">
                            ${this.notifications.map(notification => `
                                <div class="list-group-item ${!notification.read ? 'list-group-item-light' : ''}">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${notification.title}</h6>
                                        <small>${app.formatDateTime(notification.timestamp)}</small>
                                    </div>
                                    <p class="mb-1">${notification.message}</p>
                                    <small class="text-${notification.type}">
                                        <i class="fas fa-circle"></i>
                                        ${notification.type}
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted text-center">لا توجد تنبيهات</p>'}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-outline-danger" onclick="advancedFeatures.clearAllNotifications()">
                    <i class="fas fa-trash"></i>
                    مسح جميع التنبيهات
                </button>
            </div>
        `;

        app.openModal('مركز التنبيهات', notificationsHTML);
        this.markAllAsRead();
    }

    // تحديد جميع التنبيهات كمقروءة
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        this.updateNotificationBadge();
    }

    // مسح جميع التنبيهات
    clearAllNotifications() {
        if (app.confirmDelete('هل أنت متأكد من مسح جميع التنبيهات؟')) {
            this.notifications = [];
            localStorage.removeItem('notifications');
            this.updateNotificationBadge();
            app.closeModal();
            app.showAlert('تم مسح جميع التنبيهات', 'success');
        }
    }

    // نظام الأمان والصلاحيات
    checkPermission(action, userId = null) {
        const currentUser = app.currentUser;
        if (!currentUser) return false;

        // المدير له جميع الصلاحيات
        if (currentUser.role === 'admin') return true;

        // صلاحيات المستخدم العادي
        const userPermissions = [
            'view_dashboard',
            'view_lands',
            'view_plots',
            'view_customers',
            'view_sales',
            'add_customer',
            'add_payment'
        ];

        return userPermissions.includes(action);
    }

    // تشفير البيانات الحساسة
    encryptData(data) {
        // تشفير بسيط للبيانات الحساسة
        return btoa(JSON.stringify(data));
    }

    // فك تشفير البيانات
    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            console.error('خطأ في فك التشفير:', error);
            return null;
        }
    }

    // تدقيق العمليات
    logActivity(action, details) {
        const activity = {
            id: Date.now(),
            userId: app.currentUser ? app.currentUser.id : null,
            username: app.currentUser ? app.currentUser.username : 'غير محدد',
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            ipAddress: 'localhost' // في بيئة حقيقية يمكن الحصول على IP الحقيقي
        };

        const activities = JSON.parse(localStorage.getItem('activityLog') || '[]');
        activities.unshift(activity);

        // الاحتفاظ بآخر 1000 نشاط
        if (activities.length > 1000) {
            activities.splice(1000);
        }

        localStorage.setItem('activityLog', JSON.stringify(activities));
    }

    // عرض سجل الأنشطة
    showActivityLog() {
        const activities = JSON.parse(localStorage.getItem('activityLog') || '[]');
        
        const logHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h6>سجل الأنشطة</h6>
                    
                    ${activities.length > 0 ? `
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th>التاريخ والوقت</th>
                                        <th>المستخدم</th>
                                        <th>النشاط</th>
                                        <th>التفاصيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${activities.slice(0, 100).map(activity => `
                                        <tr>
                                            <td>${app.formatDateTime(activity.timestamp)}</td>
                                            <td>${activity.username}</td>
                                            <td>${activity.action}</td>
                                            <td>${activity.details}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted text-center">لا توجد أنشطة مسجلة</p>'}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-outline-danger" onclick="advancedFeatures.clearActivityLog()">
                    <i class="fas fa-trash"></i>
                    مسح السجل
                </button>
            </div>
        `;

        app.openModal('سجل الأنشطة', logHTML);
    }

    // مسح سجل الأنشطة
    clearActivityLog() {
        if (app.confirmDelete('هل أنت متأكد من مسح سجل الأنشطة؟')) {
            localStorage.removeItem('activityLog');
            app.closeModal();
            app.showAlert('تم مسح سجل الأنشطة', 'success');
        }
    }

    // نظام التذكيرات
    addReminder(title, message, dueDate, type = 'general') {
        const reminder = {
            id: Date.now(),
            title: title,
            message: message,
            dueDate: dueDate,
            type: type,
            completed: false,
            createdAt: new Date().toISOString()
        };

        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));

        app.showAlert('تم إضافة التذكير بنجاح', 'success');
    }

    // فحص التذكيرات المستحقة
    checkDueReminders() {
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        const dueReminders = reminders.filter(reminder => 
            !reminder.completed && reminder.dueDate <= today
        );

        dueReminders.forEach(reminder => {
            this.addNotification(
                'تذكير مستحق',
                `${reminder.title}: ${reminder.message}`,
                'warning',
                false
            );
        });
    }

    // تصدير البيانات بتنسيقات متعددة
    exportToExcel() {
        // تحويل البيانات إلى تنسيق CSV للاستيراد في Excel
        const data = {
            lands: db.getAll('lands'),
            plots: db.getAll('plots'),
            customers: db.getAll('customers'),
            sales: db.getAll('sales'),
            payments: db.getAll('payments'),
            expenses: db.getAll('expenses')
        };

        let csvContent = '';
        
        // تصدير كل جدول في ورقة منفصلة
        Object.keys(data).forEach(tableName => {
            csvContent += `\n\n=== ${tableName.toUpperCase()} ===\n`;
            
            if (data[tableName].length > 0) {
                const headers = Object.keys(data[tableName][0]);
                csvContent += headers.join(',') + '\n';
                
                data[tableName].forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        return typeof value === 'string' ? `"${value}"` : value;
                    });
                    csvContent += values.join(',') + '\n';
                });
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `land_sales_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        app.showAlert('تم تصدير البيانات بتنسيق Excel بنجاح', 'success');
    }

    // إعدادات النظام
    showSystemSettings() {
        const settings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        
        const settingsHTML = `
            <form id="systemSettingsForm">
                <div class="row">
                    <div class="col-md-6">
                        <h6>إعدادات عامة</h6>
                        <div class="mb-3">
                            <label for="companyName" class="form-label">اسم الشركة</label>
                            <input type="text" class="form-control" id="companyName" value="${settings.companyName || 'شركة الأراضي المتطورة'}">
                        </div>
                        <div class="mb-3">
                            <label for="currency" class="form-label">العملة</label>
                            <select class="form-control" id="currency">
                                <option value="ريال" ${settings.currency === 'ريال' ? 'selected' : ''}>ريال سعودي</option>
                                <option value="درهم" ${settings.currency === 'درهم' ? 'selected' : ''}>درهم إماراتي</option>
                                <option value="دينار" ${settings.currency === 'دينار' ? 'selected' : ''}>دينار كويتي</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="dateFormat" class="form-label">تنسيق التاريخ</label>
                            <select class="form-control" id="dateFormat">
                                <option value="ar-SA" ${settings.dateFormat === 'ar-SA' ? 'selected' : ''}>عربي</option>
                                <option value="en-US" ${settings.dateFormat === 'en-US' ? 'selected' : ''}>إنجليزي</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>إعدادات النسخ الاحتياطي</h6>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="autoBackup" ${settings.autoBackup ? 'checked' : ''}>
                                <label class="form-check-label" for="autoBackup">
                                    تفعيل النسخ الاحتياطي التلقائي
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="backupInterval" class="form-label">فترة النسخ الاحتياطي (دقيقة)</label>
                            <input type="number" class="form-control" id="backupInterval" value="${settings.backupInterval || 30}" min="5" max="1440">
                        </div>
                        
                        <h6>إعدادات التنبيهات</h6>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="enableNotifications" ${settings.enableNotifications !== false ? 'checked' : ''}>
                                <label class="form-check-label" for="enableNotifications">
                                    تفعيل التنبيهات
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ الإعدادات</button>
                </div>
            </form>
        `;

        app.openModal('إعدادات النظام', settingsHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('systemSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });
    }

    // حفظ إعدادات النظام
    saveSystemSettings() {
        const settings = {
            companyName: document.getElementById('companyName').value,
            currency: document.getElementById('currency').value,
            dateFormat: document.getElementById('dateFormat').value,
            autoBackup: document.getElementById('autoBackup').checked,
            backupInterval: parseInt(document.getElementById('backupInterval').value),
            enableNotifications: document.getElementById('enableNotifications').checked
        };

        localStorage.setItem('systemSettings', JSON.stringify(settings));

        // تطبيق الإعدادات
        if (settings.autoBackup) {
            this.enableAutoBackup(settings.backupInterval);
        }

        app.closeModal();
        app.showAlert('تم حفظ الإعدادات بنجاح', 'success');
    }

    // تهيئة الميزات المتقدمة
    initialize() {
        // تحميل الإعدادات
        const settings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        
        // تفعيل النسخ الاحتياطي التلقائي إذا كان مفعلاً
        if (settings.autoBackup) {
            this.enableAutoBackup(settings.backupInterval || 30);
        }

        // تحميل التنبيهات
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        this.updateNotificationBadge();

        // فحص التذكيرات المستحقة
        this.checkDueReminders();

        // تسجيل نشاط تسجيل الدخول
        if (app.currentUser) {
            this.logActivity('تسجيل دخول', `المستخدم ${app.currentUser.username} سجل دخول للنظام`);
        }
    }
}

// إنشاء مثيل من الميزات المتقدمة
const advancedFeatures = new AdvancedFeatures();

// تهيئة الميزات المتقدمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        advancedFeatures.initialize();
    }, 1000);
});
