// إدارة العملاء
class CustomersManager {
    constructor() {
        this.currentCustomer = null;
    }

    // عرض قائمة العملاء
    render() {
        const customers = db.getAll('customers');
        const customersHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-users"></i>
                        إدارة العملاء
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="customersManager.showAddForm()">
                            <i class="fas fa-user-plus"></i>
                            إضافة عميل جديد
                        </button>
                        <button class="btn btn-outline-info" onclick="customersManager.showSearchForm()">
                            <i class="fas fa-search"></i>
                            البحث
                        </button>
                    </div>
                </div>
            </div>

            <!-- شريط البحث -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body py-2">
                            <div class="input-group">
                                <input type="text" class="form-control" id="customerSearch" placeholder="البحث في العملاء (الاسم، الهاتف، الهوية)">
                                <button class="btn btn-outline-secondary" onclick="customersManager.searchCustomers()">
                                    <i class="fas fa-search"></i>
                                </button>
                                <button class="btn btn-outline-secondary" onclick="customersManager.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-list"></i>
                        قائمة العملاء (${customers.length})
                    </h5>
                </div>
                <div class="card-body">
                    <div id="customersTableContainer">
                        ${this.renderCustomersTable(customers)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('customers').innerHTML = customersHTML;

        // إعداد البحث المباشر
        document.getElementById('customerSearch').addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                this.searchCustomers();
            } else if (e.target.value.length === 0) {
                this.clearSearch();
            }
        });
    }

    // عرض جدول العملاء
    renderCustomersTable(customers) {
        if (customers.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد عملاء مسجلين</h5>
                    <p class="text-muted">ابدأ بإضافة عميل جديد</p>
                    <button class="btn btn-primary" onclick="customersManager.showAddForm()">
                        <i class="fas fa-user-plus"></i>
                        إضافة عميل جديد
                    </button>
                </div>
            `;
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>الرقم</th>
                            <th>الاسم</th>
                            <th>الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>رقم الهوية</th>
                            <th>عدد المشتريات</th>
                            <th>تاريخ التسجيل</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        customers.forEach(customer => {
            const sales = db.getAll('sales').filter(s => s.customerId === customer.id);
            tableHTML += `
                <tr>
                    <td>${customer.id}</td>
                    <td><strong>${customer.name}</strong></td>
                    <td>
                        <a href="tel:${customer.phone}" class="text-decoration-none">
                            <i class="fas fa-phone"></i>
                            ${customer.phone}
                        </a>
                    </td>
                    <td>
                        ${customer.email ? `
                            <a href="mailto:${customer.email}" class="text-decoration-none">
                                <i class="fas fa-envelope"></i>
                                ${customer.email}
                            </a>
                        ` : '<span class="text-muted">غير محدد</span>'}
                    </td>
                    <td>${customer.nationalId || '<span class="text-muted">غير محدد</span>'}</td>
                    <td>
                        <span class="badge bg-info">${sales.length}</span>
                    </td>
                    <td>${app.formatDate(customer.createdAt)}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="customersManager.viewCustomer(${customer.id})">
                                <i class="fas fa-eye"></i>
                                عرض
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="customersManager.showEditForm(${customer.id})">
                                <i class="fas fa-edit"></i>
                                تعديل
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="salesManager.showAddForm(null, ${customer.id})">
                                <i class="fas fa-handshake"></i>
                                بيع
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="customersManager.deleteCustomer(${customer.id})">
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
                </table>
            </div>
        `;

        return tableHTML;
    }

    // عرض نموذج إضافة عميل
    showAddForm() {
        const formHTML = `
            <form id="addCustomerForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="customerName" class="form-label">الاسم الكامل *</label>
                            <input type="text" class="form-control" id="customerName" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="customerPhone" class="form-label">رقم الهاتف *</label>
                            <input type="tel" class="form-control" id="customerPhone" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="customerEmail" class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="customerEmail">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="customerNationalId" class="form-label">رقم الهوية</label>
                            <input type="text" class="form-control" id="customerNationalId">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="customerAddress" class="form-label">العنوان</label>
                    <textarea class="form-control" id="customerAddress" rows="3"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ العميل</button>
                </div>
            </form>
        `;

        app.openModal('إضافة عميل جديد', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addCustomerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomer();
        });
    }

    // إضافة عميل جديد
    addCustomer() {
        const customerData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            nationalId: document.getElementById('customerNationalId').value,
            address: document.getElementById('customerAddress').value
        };

        const newCustomer = db.add('customers', customerData);
        app.closeModal();
        app.showAlert('تم إضافة العميل بنجاح', 'success');
        this.render();
    }

    // عرض نموذج تعديل عميل
    showEditForm(customerId) {
        const customer = db.getById('customers', customerId);
        if (!customer) return;

        const formHTML = `
            <form id="editCustomerForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editCustomerName" class="form-label">الاسم الكامل *</label>
                            <input type="text" class="form-control" id="editCustomerName" value="${customer.name}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editCustomerPhone" class="form-label">رقم الهاتف *</label>
                            <input type="tel" class="form-control" id="editCustomerPhone" value="${customer.phone}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editCustomerEmail" class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="editCustomerEmail" value="${customer.email || ''}">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editCustomerNationalId" class="form-label">رقم الهوية</label>
                            <input type="text" class="form-control" id="editCustomerNationalId" value="${customer.nationalId || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="editCustomerAddress" class="form-label">العنوان</label>
                    <textarea class="form-control" id="editCustomerAddress" rows="3">${customer.address || ''}</textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ التعديلات</button>
                </div>
            </form>
        `;

        app.openModal('تعديل العميل', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('editCustomerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCustomer(customerId);
        });
    }

    // تحديث عميل
    updateCustomer(customerId) {
        const updatedData = {
            name: document.getElementById('editCustomerName').value,
            phone: document.getElementById('editCustomerPhone').value,
            email: document.getElementById('editCustomerEmail').value,
            nationalId: document.getElementById('editCustomerNationalId').value,
            address: document.getElementById('editCustomerAddress').value
        };

        db.update('customers', customerId, updatedData);
        app.closeModal();
        app.showAlert('تم تحديث العميل بنجاح', 'success');
        this.render();
    }

    // عرض تفاصيل عميل
    viewCustomer(customerId) {
        const customer = db.getById('customers', customerId);
        const sales = db.getAll('sales').filter(s => s.customerId === customerId);
        
        if (!customer) return;

        // حساب إجمالي المشتريات والمدفوعات
        const totalPurchases = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const allPayments = db.getAll('payments');
        const customerPayments = allPayments.filter(payment => {
            const sale = sales.find(s => s.id === payment.saleId);
            return sale !== undefined;
        });
        const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalOutstanding = totalPurchases - totalPaid;

        const viewHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>معلومات العميل</h6>
                    <table class="table table-borderless">
                        <tr><td><strong>الاسم:</strong></td><td>${customer.name}</td></tr>
                        <tr><td><strong>الهاتف:</strong></td><td>
                            <a href="tel:${customer.phone}" class="text-decoration-none">
                                <i class="fas fa-phone"></i> ${customer.phone}
                            </a>
                        </td></tr>
                        <tr><td><strong>البريد الإلكتروني:</strong></td><td>
                            ${customer.email ? `
                                <a href="mailto:${customer.email}" class="text-decoration-none">
                                    <i class="fas fa-envelope"></i> ${customer.email}
                                </a>
                            ` : 'غير محدد'}
                        </td></tr>
                        <tr><td><strong>رقم الهوية:</strong></td><td>${customer.nationalId || 'غير محدد'}</td></tr>
                        <tr><td><strong>تاريخ التسجيل:</strong></td><td>${app.formatDate(customer.createdAt)}</td></tr>
                    </table>
                    ${customer.address ? `<p><strong>العنوان:</strong><br>${customer.address}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>الملخص المالي</h6>
                    <div class="row">
                        <div class="col-12 mb-2">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="text-primary">${app.formatCurrency(totalPurchases)}</h5>
                                    <small>إجمالي المشتريات</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-2">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="text-success">${app.formatCurrency(totalPaid)}</h5>
                                    <small>المبلغ المدفوع</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-2">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="text-warning">${app.formatCurrency(totalOutstanding)}</h5>
                                    <small>المبلغ المتبقي</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${sales.length > 0 ? `
                <hr>
                <h6>تاريخ المشتريات</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>رقم العقد</th>
                                <th>القطعة</th>
                                <th>تاريخ البيع</th>
                                <th>المبلغ الإجمالي</th>
                                <th>المبلغ المدفوع</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.map(sale => {
                                const plot = db.getById('plots', sale.plotId);
                                const salePayments = customerPayments.filter(p => p.saleId === sale.id);
                                const salePaid = salePayments.reduce((sum, p) => sum + p.amount, 0);
                                const saleOutstanding = sale.totalAmount - salePaid;
                                
                                return `
                                    <tr>
                                        <td>${sale.contractNumber}</td>
                                        <td>${plot ? plot.plotNumber : 'غير محدد'}</td>
                                        <td>${app.formatDate(sale.saleDate)}</td>
                                        <td>${app.formatCurrency(sale.totalAmount)}</td>
                                        <td>${app.formatCurrency(salePaid)}</td>
                                        <td>${app.formatCurrency(saleOutstanding)}</td>
                                        <td>
                                            <span class="badge ${saleOutstanding > 0 ? 'bg-warning' : 'bg-success'}">
                                                ${saleOutstanding > 0 ? 'جاري السداد' : 'مكتمل'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">لا توجد مشتريات لهذا العميل</p>'}
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-success" onclick="salesManager.showAddForm(null, ${customer.id})">
                    <i class="fas fa-handshake"></i>
                    إضافة بيع جديد
                </button>
            </div>
        `;

        app.openModal(`تفاصيل العميل: ${customer.name}`, viewHTML);
    }

    // حذف عميل
    deleteCustomer(customerId) {
        const customer = db.getById('customers', customerId);
        const sales = db.getAll('sales').filter(s => s.customerId === customerId);
        
        if (!customer) return;

        if (sales.length > 0) {
            app.showAlert('لا يمكن حذف هذا العميل لأنه مرتبط بعمليات بيع', 'warning');
            return;
        }

        if (!app.confirmDelete('هل أنت متأكد من حذف هذا العميل؟')) {
            return;
        }

        db.delete('customers', customerId);
        app.showAlert('تم حذف العميل بنجاح', 'success');
        this.render();
    }

    // البحث في العملاء
    searchCustomers() {
        const searchTerm = document.getElementById('customerSearch').value;
        if (searchTerm.length < 1) {
            this.clearSearch();
            return;
        }

        const results = db.search('customers', searchTerm, ['name', 'phone', 'email', 'nationalId']);
        document.getElementById('customersTableContainer').innerHTML = this.renderCustomersTable(results);
    }

    // مسح البحث
    clearSearch() {
        document.getElementById('customerSearch').value = '';
        const customers = db.getAll('customers');
        document.getElementById('customersTableContainer').innerHTML = this.renderCustomersTable(customers);
    }

    // تصدير قائمة العملاء
    exportCustomers() {
        const customers = db.getAll('customers');
        const csvContent = this.convertToCSV(customers);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        app.showAlert('تم تصدير قائمة العملاء بنجاح', 'success');
    }

    // تحويل البيانات إلى CSV
    convertToCSV(customers) {
        const headers = ['الرقم', 'الاسم', 'الهاتف', 'البريد الإلكتروني', 'رقم الهوية', 'العنوان', 'تاريخ التسجيل'];
        const csvRows = [headers.join(',')];
        
        customers.forEach(customer => {
            const row = [
                customer.id,
                `"${customer.name}"`,
                customer.phone,
                customer.email || '',
                customer.nationalId || '',
                `"${customer.address || ''}"`,
                app.formatDate(customer.createdAt)
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
}

// إنشاء مثيل من مدير العملاء
const customersManager = new CustomersManager();
