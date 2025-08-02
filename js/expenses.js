// إدارة المصروفات
class ExpensesManager {
    constructor() {
        this.currentExpense = null;
        this.categories = [
            'تطوير الأرض',
            'تسويق وإعلان',
            'رسوم حكومية',
            'استشارات قانونية',
            'مصاريف إدارية',
            'صيانة وتشغيل',
            'مواصلات',
            'أخرى'
        ];
    }

    // عرض قائمة المصروفات
    render() {
        const expenses = db.getAll('expenses');
        const expensesHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-receipt"></i>
                        إدارة المصروفات
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="expensesManager.showAddForm()">
                            <i class="fas fa-plus"></i>
                            تسجيل مصروف جديد
                        </button>
                        <button class="btn btn-outline-info" onclick="expensesManager.showCategoryReport()">
                            <i class="fas fa-chart-pie"></i>
                            تقرير الفئات
                        </button>
                    </div>
                </div>
            </div>

            <!-- إحصائيات سريعة -->
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-primary">${expenses.length}</h4>
                            <small>إجمالي المصروفات</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-danger">${app.formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</h4>
                            <small>إجمالي المبلغ</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-warning">${app.formatCurrency(this.getMonthlyExpenses())}</h4>
                            <small>مصروفات هذا الشهر</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-info">${this.getUniqueCategories().length}</h4>
                            <small>عدد الفئات</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- فلاتر -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body py-2">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <select class="form-control form-control-sm" id="categoryFilter" onchange="expensesManager.filterByCategory(this.value)">
                                        <option value="">جميع الفئات</option>
                                        ${this.getUniqueCategories().map(category => `
                                            <option value="${category}">${category}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <input type="month" class="form-control form-control-sm" id="monthFilter" onchange="expensesManager.filterByMonth(this.value)">
                                </div>
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <input type="text" class="form-control form-control-sm" id="expenseSearch" placeholder="البحث في المصروفات">
                                        <button class="btn btn-outline-secondary btn-sm" onclick="expensesManager.searchExpenses()">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-list"></i>
                        قائمة المصروفات
                    </h5>
                </div>
                <div class="card-body">
                    <div id="expensesTableContainer">
                        ${this.renderExpensesTable(expenses)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('expenses').innerHTML = expensesHTML;

        // إعداد البحث المباشر
        document.getElementById('expenseSearch').addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                this.searchExpenses();
            } else if (e.target.value.length === 0) {
                this.clearFilters();
            }
        });
    }

    // عرض جدول المصروفات
    renderExpensesTable(expenses) {
        if (expenses.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد مصروفات مسجلة</h5>
                    <p class="text-muted">ابدأ بتسجيل مصروف جديد</p>
                    <button class="btn btn-primary" onclick="expensesManager.showAddForm()">
                        <i class="fas fa-plus"></i>
                        تسجيل مصروف جديد
                    </button>
                </div>
            `;
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الفئة</th>
                            <th>الوصف</th>
                            <th>المبلغ</th>
                            <th>الأرض المرتبطة</th>
                            <th>رقم الإيصال</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        expenses.forEach(expense => {
            const land = expense.landId ? db.getById('lands', expense.landId) : null;
            tableHTML += `
                <tr>
                    <td>${app.formatDate(expense.expenseDate)}</td>
                    <td>
                        <span class="badge bg-secondary">${expense.category}</span>
                    </td>
                    <td>${expense.description}</td>
                    <td><strong class="text-danger">${app.formatCurrency(expense.amount)}</strong></td>
                    <td>${land ? land.name : '<span class="text-muted">عام</span>'}</td>
                    <td>${expense.receiptNumber || '<span class="text-muted">غير محدد</span>'}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="expensesManager.viewExpense(${expense.id})">
                                <i class="fas fa-eye"></i>
                                عرض
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="expensesManager.showEditForm(${expense.id})">
                                <i class="fas fa-edit"></i>
                                تعديل
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="expensesManager.deleteExpense(${expense.id})">
                                <i class="fas fa-trash"></i>
                                حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                    <tfoot>
                        <tr class="table-info">
                            <td colspan="3"><strong>الإجمالي:</strong></td>
                            <td><strong class="text-danger">${app.formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</strong></td>
                            <td colspan="3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        return tableHTML;
    }

    // عرض نموذج إضافة مصروف
    showAddForm() {
        const lands = db.getAll('lands');
        
        const formHTML = `
            <form id="addExpenseForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="expenseCategory" class="form-label">الفئة *</label>
                            <select class="form-control" id="expenseCategory" required>
                                <option value="">اختر الفئة</option>
                                ${this.categories.map(category => `
                                    <option value="${category}">${category}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="expenseDate" class="form-label">تاريخ المصروف *</label>
                            <input type="date" class="form-control" id="expenseDate" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="expenseDescription" class="form-label">وصف المصروف *</label>
                    <input type="text" class="form-control" id="expenseDescription" required>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="expenseAmount" class="form-label">المبلغ (ريال) *</label>
                            <input type="number" class="form-control" id="expenseAmount" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="expenseLandId" class="form-label">الأرض المرتبطة</label>
                            <select class="form-control" id="expenseLandId">
                                <option value="">مصروف عام</option>
                                ${lands.map(land => `
                                    <option value="${land.id}">${land.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="receiptNumber" class="form-label">رقم الإيصال</label>
                            <input type="text" class="form-control" id="receiptNumber">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="expenseNotes" class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="expenseNotes" rows="3"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ المصروف</button>
                </div>
            </form>
        `;

        app.openModal('تسجيل مصروف جديد', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
    }

    // إضافة مصروف جديد
    addExpense() {
        const expenseData = {
            category: document.getElementById('expenseCategory').value,
            description: document.getElementById('expenseDescription').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            expenseDate: document.getElementById('expenseDate').value,
            landId: document.getElementById('expenseLandId').value ? parseInt(document.getElementById('expenseLandId').value) : null,
            receiptNumber: document.getElementById('receiptNumber').value,
            notes: document.getElementById('expenseNotes').value
        };

        const newExpense = db.add('expenses', expenseData);
        app.closeModal();
        app.showAlert('تم تسجيل المصروف بنجاح', 'success');
        this.render();
    }

    // عرض نموذج تعديل مصروف
    showEditForm(expenseId) {
        const expense = db.getById('expenses', expenseId);
        const lands = db.getAll('lands');
        
        if (!expense) return;

        const formHTML = `
            <form id="editExpenseForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editExpenseCategory" class="form-label">الفئة *</label>
                            <select class="form-control" id="editExpenseCategory" required>
                                ${this.categories.map(category => `
                                    <option value="${category}" ${expense.category === category ? 'selected' : ''}>
                                        ${category}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editExpenseDate" class="form-label">تاريخ المصروف *</label>
                            <input type="date" class="form-control" id="editExpenseDate" value="${expense.expenseDate}" required>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="editExpenseDescription" class="form-label">وصف المصروف *</label>
                    <input type="text" class="form-control" id="editExpenseDescription" value="${expense.description}" required>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editExpenseAmount" class="form-label">المبلغ (ريال) *</label>
                            <input type="number" class="form-control" id="editExpenseAmount" value="${expense.amount}" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editExpenseLandId" class="form-label">الأرض المرتبطة</label>
                            <select class="form-control" id="editExpenseLandId">
                                <option value="">مصروف عام</option>
                                ${lands.map(land => `
                                    <option value="${land.id}" ${expense.landId == land.id ? 'selected' : ''}>
                                        ${land.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editReceiptNumber" class="form-label">رقم الإيصال</label>
                            <input type="text" class="form-control" id="editReceiptNumber" value="${expense.receiptNumber || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="editExpenseNotes" class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="editExpenseNotes" rows="3">${expense.notes || ''}</textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ التعديلات</button>
                </div>
            </form>
        `;

        app.openModal('تعديل المصروف', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('editExpenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateExpense(expenseId);
        });
    }

    // تحديث مصروف
    updateExpense(expenseId) {
        const updatedData = {
            category: document.getElementById('editExpenseCategory').value,
            description: document.getElementById('editExpenseDescription').value,
            amount: parseFloat(document.getElementById('editExpenseAmount').value),
            expenseDate: document.getElementById('editExpenseDate').value,
            landId: document.getElementById('editExpenseLandId').value ? parseInt(document.getElementById('editExpenseLandId').value) : null,
            receiptNumber: document.getElementById('editReceiptNumber').value,
            notes: document.getElementById('editExpenseNotes').value
        };

        db.update('expenses', expenseId, updatedData);
        app.closeModal();
        app.showAlert('تم تحديث المصروف بنجاح', 'success');
        this.render();
    }

    // عرض تفاصيل مصروف
    viewExpense(expenseId) {
        const expense = db.getById('expenses', expenseId);
        const land = expense.landId ? db.getById('lands', expense.landId) : null;
        
        if (!expense) return;

        const viewHTML = `
            <div class="row">
                <div class="col-md-12">
                    <table class="table table-borderless">
                        <tr><td><strong>الفئة:</strong></td><td><span class="badge bg-secondary">${expense.category}</span></td></tr>
                        <tr><td><strong>الوصف:</strong></td><td>${expense.description}</td></tr>
                        <tr><td><strong>المبلغ:</strong></td><td><strong class="text-danger">${app.formatCurrency(expense.amount)}</strong></td></tr>
                        <tr><td><strong>تاريخ المصروف:</strong></td><td>${app.formatDate(expense.expenseDate)}</td></tr>
                        <tr><td><strong>الأرض المرتبطة:</strong></td><td>${land ? land.name : '<span class="text-muted">مصروف عام</span>'}</td></tr>
                        <tr><td><strong>رقم الإيصال:</strong></td><td>${expense.receiptNumber || '<span class="text-muted">غير محدد</span>'}</td></tr>
                        <tr><td><strong>تاريخ التسجيل:</strong></td><td>${app.formatDate(expense.createdAt)}</td></tr>
                    </table>
                    ${expense.notes ? `<p><strong>ملاحظات:</strong><br>${expense.notes}</p>` : ''}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-outline-secondary" onclick="expensesManager.showEditForm(${expense.id})">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
            </div>
        `;

        app.openModal(`تفاصيل المصروف: ${expense.description}`, viewHTML);
    }

    // حذف مصروف
    deleteExpense(expenseId) {
        const expense = db.getById('expenses', expenseId);
        if (!expense) return;

        if (!app.confirmDelete('هل أنت متأكد من حذف هذا المصروف؟')) {
            return;
        }

        db.delete('expenses', expenseId);
        app.showAlert('تم حذف المصروف بنجاح', 'success');
        this.render();
    }

    // تصفية حسب الفئة
    filterByCategory(category) {
        const expenses = db.getAll('expenses');
        const filteredExpenses = category ? expenses.filter(e => e.category === category) : expenses;
        document.getElementById('expensesTableContainer').innerHTML = this.renderExpensesTable(filteredExpenses);
    }

    // تصفية حسب الشهر
    filterByMonth(month) {
        if (!month) {
            this.clearFilters();
            return;
        }

        const expenses = db.getAll('expenses');
        const filteredExpenses = expenses.filter(expense => {
            const expenseMonth = expense.expenseDate.substring(0, 7);
            return expenseMonth === month;
        });
        
        document.getElementById('expensesTableContainer').innerHTML = this.renderExpensesTable(filteredExpenses);
    }

    // البحث في المصروفات
    searchExpenses() {
        const searchTerm = document.getElementById('expenseSearch').value;
        if (searchTerm.length < 1) {
            this.clearFilters();
            return;
        }

        const results = db.search('expenses', searchTerm, ['category', 'description', 'receiptNumber', 'notes']);
        document.getElementById('expensesTableContainer').innerHTML = this.renderExpensesTable(results);
    }

    // مسح الفلاتر
    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('monthFilter').value = '';
        document.getElementById('expenseSearch').value = '';
        const expenses = db.getAll('expenses');
        document.getElementById('expensesTableContainer').innerHTML = this.renderExpensesTable(expenses);
    }

    // الحصول على الفئات الفريدة
    getUniqueCategories() {
        const expenses = db.getAll('expenses');
        const categories = [...new Set(expenses.map(e => e.category))];
        return categories.sort();
    }

    // الحصول على مصروفات الشهر الحالي
    getMonthlyExpenses() {
        const expenses = db.getAll('expenses');
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        return expenses
            .filter(expense => expense.expenseDate.substring(0, 7) === currentMonth)
            .reduce((sum, expense) => sum + expense.amount, 0);
    }

    // عرض تقرير الفئات
    showCategoryReport() {
        const expenses = db.getAll('expenses');
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        const reportHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>تقرير المصروفات حسب الفئة</h6>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>الفئة</th>
                                    <th>المبلغ</th>
                                    <th>النسبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(categoryTotals).map(([category, total]) => {
                                    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
                                    const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : 0;
                                    return `
                                        <tr>
                                            <td>${category}</td>
                                            <td>${app.formatCurrency(total)}</td>
                                            <td>${percentage}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('categoryReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('تقرير المصروفات حسب الفئة', reportHTML);

        // رسم الرسم البياني
        setTimeout(() => {
            this.renderCategoryChart(categoryTotals);
        }, 100);
    }

    // رسم رسم بياني للفئات
    renderCategoryChart(categoryTotals) {
        const ctx = document.getElementById('categoryChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(categoryTotals),
                    datasets: [{
                        data: Object.values(categoryTotals),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40',
                            '#FF6384',
                            '#C9CBCF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
}

// إنشاء مثيل من مدير المصروفات
const expensesManager = new ExpensesManager();
