// نظام إدارة قاعدة البيانات المحلية
class LocalDatabase {
    constructor() {
        this.initializeDatabase();
    }

    // تهيئة قاعدة البيانات
    initializeDatabase() {
        // إنشاء الجداول الأساسية إذا لم تكن موجودة
        if (!localStorage.getItem('lands')) {
            localStorage.setItem('lands', JSON.stringify([]));
        }
        if (!localStorage.getItem('plots')) {
            localStorage.setItem('plots', JSON.stringify([]));
        }
        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([]));
        }
        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
        }
        if (!localStorage.getItem('expenses')) {
            localStorage.setItem('expenses', JSON.stringify([]));
        }
        if (!localStorage.getItem('users')) {
            // إنشاء مستخدم افتراضي
            const defaultUser = {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('users', JSON.stringify([defaultUser]));
        }
        
        // إضافة بيانات تجريبية
        this.addSampleData();
    }

    // إضافة بيانات تجريبية
    addSampleData() {
        const lands = this.getAll('lands');
        if (lands.length === 0) {
            const sampleLands = [
                {
                    id: 1,
                    name: 'أرض الواحة الشمالية',
                    location: 'شمال الرياض - طريق الملك فهد',
                    totalArea: 50000,
                    coordinates: JSON.stringify([24.7136, 46.6753]),
                    description: 'أرض سكنية في موقع متميز',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'أرض الروضة الجنوبية',
                    location: 'جنوب الرياض - حي الروضة',
                    totalArea: 30000,
                    coordinates: JSON.stringify([24.6877, 46.7219]),
                    description: 'أرض تجارية بإطلالة مميزة',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('lands', JSON.stringify(sampleLands));

            const samplePlots = [
                {
                    id: 1,
                    landId: 1,
                    plotNumber: 'A-001',
                    area: 500,
                    pricePerMeter: 1200,
                    totalPrice: 600000,
                    status: 'available',
                    coordinates: JSON.stringify([24.7136, 46.6753]),
                    description: 'قطعة زاوية مميزة',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    landId: 1,
                    plotNumber: 'A-002',
                    area: 400,
                    pricePerMeter: 1200,
                    totalPrice: 480000,
                    status: 'sold',
                    coordinates: JSON.stringify([24.7140, 46.6750]),
                    description: 'قطعة وسط',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    landId: 2,
                    plotNumber: 'B-001',
                    area: 600,
                    pricePerMeter: 1500,
                    totalPrice: 900000,
                    status: 'available',
                    coordinates: JSON.stringify([24.6877, 46.7219]),
                    description: 'قطعة تجارية كبيرة',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('plots', JSON.stringify(samplePlots));

            const sampleCustomers = [
                {
                    id: 1,
                    name: 'أحمد محمد العلي',
                    phone: '0501234567',
                    email: 'ahmed@example.com',
                    nationalId: '1234567890',
                    address: 'الرياض - حي النخيل',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'فاطمة سعد الأحمد',
                    phone: '0509876543',
                    email: 'fatima@example.com',
                    nationalId: '0987654321',
                    address: 'الرياض - حي الملز',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('customers', JSON.stringify(sampleCustomers));

            const sampleSales = [
                {
                    id: 1,
                    plotId: 2,
                    customerId: 1,
                    saleDate: new Date().toISOString().split('T')[0],
                    totalAmount: 480000,
                    paidAmount: 100000,
                    remainingAmount: 380000,
                    paymentMethod: 'تحويل بنكي',
                    contractNumber: 'CON-2024-001',
                    notes: 'دفعة أولى 100 ألف ريال',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('sales', JSON.stringify(sampleSales));

            const samplePayments = [
                {
                    id: 1,
                    saleId: 1,
                    amount: 100000,
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentMethod: 'تحويل بنكي',
                    receiptNumber: 'REC-001',
                    notes: 'الدفعة الأولى',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('payments', JSON.stringify(samplePayments));

            const sampleExpenses = [
                {
                    id: 1,
                    category: 'تطوير الأرض',
                    description: 'أعمال التسوية والتطوير',
                    amount: 50000,
                    expenseDate: new Date().toISOString().split('T')[0],
                    landId: 1,
                    receiptNumber: 'EXP-001',
                    notes: 'تطوير الأرض الشمالية',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    category: 'تسويق',
                    description: 'حملة إعلانية',
                    amount: 15000,
                    expenseDate: new Date().toISOString().split('T')[0],
                    landId: null,
                    receiptNumber: 'EXP-002',
                    notes: 'إعلانات في الصحف والمواقع',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
        }
    }

    // الحصول على جميع العناصر من جدول معين
    getAll(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    }

    // الحصول على عنصر واحد بالمعرف
    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === parseInt(id));
    }

    // إضافة عنصر جديد
    add(table, item) {
        const items = this.getAll(table);
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        item.id = newId;
        item.createdAt = new Date().toISOString();
        items.push(item);
        localStorage.setItem(table, JSON.stringify(items));
        return item;
    }

    // تحديث عنصر موجود
    update(table, id, updatedItem) {
        const items = this.getAll(table);
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            localStorage.setItem(table, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    // حذف عنصر
    delete(table, id) {
        const items = this.getAll(table);
        const filteredItems = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(table, JSON.stringify(filteredItems));
        return true;
    }

    // البحث في جدول
    search(table, searchTerm, fields) {
        const items = this.getAll(table);
        return items.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }

    // الحصول على إحصائيات
    getStats() {
        const lands = this.getAll('lands');
        const plots = this.getAll('plots');
        const customers = this.getAll('customers');
        const sales = this.getAll('sales');
        const payments = this.getAll('payments');
        const expenses = this.getAll('expenses');

        const availablePlots = plots.filter(p => p.status === 'available').length;
        const soldPlots = plots.filter(p => p.status === 'sold').length;
        const reservedPlots = plots.filter(p => p.status === 'reserved').length;

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        return {
            totalLands: lands.length,
            totalPlots: plots.length,
            availablePlots,
            soldPlots,
            reservedPlots,
            totalCustomers: customers.length,
            totalSales,
            totalPayments,
            totalExpenses,
            netProfit: totalPayments - totalExpenses,
            outstandingAmount: totalSales - totalPayments
        };
    }

    // تصدير البيانات
    exportData() {
        const data = {
            lands: this.getAll('lands'),
            plots: this.getAll('plots'),
            customers: this.getAll('customers'),
            sales: this.getAll('sales'),
            payments: this.getAll('payments'),
            expenses: this.getAll('expenses'),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // استيراد البيانات
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            Object.keys(data).forEach(table => {
                if (table !== 'exportDate') {
                    localStorage.setItem(table, JSON.stringify(data[table]));
                }
            });
            return true;
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return false;
        }
    }

    // مسح جميع البيانات
    clearAll() {
        const tables = ['lands', 'plots', 'customers', 'sales', 'payments', 'expenses'];
        tables.forEach(table => {
            localStorage.setItem(table, JSON.stringify([]));
        });
    }
}

// إنشاء مثيل من قاعدة البيانات
const db = new LocalDatabase();
