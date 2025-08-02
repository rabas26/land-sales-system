// إدارة المبيعات
class SalesManager {
    constructor() {
        this.currentSale = null;
    }

    // عرض قائمة المبيعات
    render() {
        const sales = db.getAll('sales');
        const salesHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-handshake"></i>
                        إدارة المبيعات
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="salesManager.showAddForm()">
                            <i class="fas fa-plus"></i>
                            تسجيل بيع جديد
                        </button>
                        <button class="btn btn-outline-success" onclick="salesManager.showPaymentForm()">
                            <i class="fas fa-credit-card"></i>
                            تسجيل دفعة
                        </button>
                    </div>
                </div>
            </div>

            <!-- إحصائيات سريعة -->
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-primary">${sales.length}</h4>
                            <small>إجمالي المبيعات</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-success">${app.formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0))}</h4>
                            <small>قيمة المبيعات</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-info">${app.formatCurrency(this.getTotalPayments())}</h4>
                            <small>المحصل</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-warning">${app.formatCurrency(this.getTotalOutstanding())}</h4>
                            <small>المتبقي</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-list"></i>
                        قائمة المبيعات
                    </h5>
                </div>
                <div class="card-body">
                    ${this.renderSalesTable(sales)}
                </div>
            </div>
        `;

        document.getElementById('sales').innerHTML = salesHTML;
    }

    // عرض جدول المبيعات
    renderSalesTable(sales) {
        if (sales.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-handshake fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد مبيعات مسجلة</h5>
                    <p class="text-muted">ابدأ بتسجيل بيع جديد</p>
                    <button class="btn btn-primary" onclick="salesManager.showAddForm()">
                        <i class="fas fa-plus"></i>
                        تسجيل بيع جديد
                    </button>
                </div>
            `;
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>رقم العقد</th>
                            <th>العميل</th>
                            <th>القطعة</th>
                            <th>تاريخ البيع</th>
                            <th>المبلغ الإجمالي</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        sales.forEach(sale => {
            const customer = db.getById('customers', sale.customerId);
            const plot = db.getById('plots', sale.plotId);
            const payments = db.getAll('payments').filter(p => p.saleId === sale.id);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = sale.totalAmount - totalPaid;

            tableHTML += `
                <tr>
                    <td><strong>${sale.contractNumber}</strong></td>
                    <td>${customer ? customer.name : 'غير محدد'}</td>
                    <td>${plot ? plot.plotNumber : 'غير محدد'}</td>
                    <td>${app.formatDate(sale.saleDate)}</td>
                    <td><strong>${app.formatCurrency(sale.totalAmount)}</strong></td>
                    <td class="text-success">${app.formatCurrency(totalPaid)}</td>
                    <td class="text-warning">${app.formatCurrency(remaining)}</td>
                    <td>
                        <span class="badge ${remaining > 0 ? 'bg-warning' : 'bg-success'}">
                            ${remaining > 0 ? 'جاري السداد' : 'مكتمل'}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="salesManager.viewSale(${sale.id})">
                                <i class="fas fa-eye"></i>
                                عرض
                            </button>
                            ${remaining > 0 ? `
                                <button class="btn btn-sm btn-outline-success" onclick="salesManager.showPaymentForm(${sale.id})">
                                    <i class="fas fa-credit-card"></i>
                                    دفعة
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-info" onclick="salesManager.printContract(${sale.id})">
                                <i class="fas fa-print"></i>
                                طباعة
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

    // عرض نموذج إضافة بيع
    showAddForm(plotId = null, customerId = null) {
        const plots = db.getAll('plots').filter(p => p.status === 'available');
        const customers = db.getAll('customers');

        if (plots.length === 0) {
            app.showAlert('لا توجد قطع متاحة للبيع', 'warning');
            return;
        }

        const formHTML = `
            <form id="addSaleForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="saleCustomerId" class="form-label">العميل *</label>
                            <select class="form-control" id="saleCustomerId" required>
                                <option value="">اختر العميل</option>
                                ${customers.map(customer => `
                                    <option value="${customer.id}" ${customerId == customer.id ? 'selected' : ''}>
                                        ${customer.name} - ${customer.phone}
                                    </option>
                                `).join('')}
                            </select>
                            <small class="form-text text-muted">
                                <a href="#" onclick="customersManager.showAddForm()">إضافة عميل جديد</a>
                            </small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="salePlotId" class="form-label">القطعة *</label>
                            <select class="form-control" id="salePlotId" required onchange="salesManager.updateSaleAmount()">
                                <option value="">اختر القطعة</option>
                                ${plots.map(plot => {
                                    const land = db.getById('lands', plot.landId);
                                    return `
                                        <option value="${plot.id}" data-price="${plot.totalPrice}" ${plotId == plot.id ? 'selected' : ''}>
                                            ${plot.plotNumber} - ${land ? land.name : 'غير محدد'} (${app.formatCurrency(plot.totalPrice)})
                                        </option>
                                    `;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="saleDate" class="form-label">تاريخ البيع *</label>
                            <input type="date" class="form-control" id="saleDate" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="totalAmount" class="form-label">المبلغ الإجمالي (ريال) *</label>
                            <input type="number" class="form-control" id="totalAmount" step="0.01" required readonly>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="contractNumber" class="form-label">رقم العقد</label>
                            <input type="text" class="form-control" id="contractNumber" value="CON-${Date.now()}">
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="paymentMethod" class="form-label">طريقة الدفع</label>
                            <select class="form-control" id="paymentMethod">
                                <option value="">اختر طريقة الدفع</option>
                                <option value="نقدي">نقدي</option>
                                <option value="تحويل بنكي">تحويل بنكي</option>
                                <option value="شيك">شيك</option>
                                <option value="أقساط">أقساط</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="initialPayment" class="form-label">الدفعة الأولى (ريال)</label>
                            <input type="number" class="form-control" id="initialPayment" step="0.01" value="0">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="saleNotes" class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="saleNotes" rows="3"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">تسجيل البيع</button>
                </div>
            </form>
        `;

        app.openModal('تسجيل بيع جديد', formHTML);

        // تحديث المبلغ عند اختيار القطعة
        if (plotId) {
            setTimeout(() => {
                this.updateSaleAmount();
            }, 100);
        }

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addSaleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSale();
        });
    }

    // تحديث مبلغ البيع
    updateSaleAmount() {
        const plotSelect = document.getElementById('salePlotId');
        const selectedOption = plotSelect.options[plotSelect.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.price) {
            document.getElementById('totalAmount').value = selectedOption.dataset.price;
        }
    }

    // إضافة بيع جديد
    addSale() {
        const plotId = parseInt(document.getElementById('salePlotId').value);
        const customerId = parseInt(document.getElementById('saleCustomerId').value);
        const totalAmount = parseFloat(document.getElementById('totalAmount').value);
        const initialPayment = parseFloat(document.getElementById('initialPayment').value) || 0;

        const saleData = {
            plotId: plotId,
            customerId: customerId,
            saleDate: document.getElementById('saleDate').value,
            totalAmount: totalAmount,
            paidAmount: initialPayment,
            remainingAmount: totalAmount - initialPayment,
            paymentMethod: document.getElementById('paymentMethod').value,
            contractNumber: document.getElementById('contractNumber').value,
            notes: document.getElementById('saleNotes').value,
            status: 'active'
        };

        // إضافة البيع
        const newSale = db.add('sales', saleData);

        // تحديث حالة القطعة
        db.update('plots', plotId, { status: 'sold' });

        // إضافة الدفعة الأولى إذا كانت موجودة
        if (initialPayment > 0) {
            const paymentData = {
                saleId: newSale.id,
                amount: initialPayment,
                paymentDate: document.getElementById('saleDate').value,
                paymentMethod: document.getElementById('paymentMethod').value,
                receiptNumber: `REC-${Date.now()}`,
                notes: 'الدفعة الأولى'
            };
            db.add('payments', paymentData);
        }

        app.closeModal();
        app.showAlert('تم تسجيل البيع بنجاح', 'success');
        this.render();
    }

    // عرض نموذج تسجيل دفعة
    showPaymentForm(saleId = null) {
        const sales = db.getAll('sales').filter(sale => {
            const payments = db.getAll('payments').filter(p => p.saleId === sale.id);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            return sale.totalAmount > totalPaid;
        });

        if (sales.length === 0) {
            app.showAlert('لا توجد مبيعات تحتاج إلى دفعات', 'info');
            return;
        }

        const formHTML = `
            <form id="addPaymentForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="paymentSaleId" class="form-label">العقد *</label>
                            <select class="form-control" id="paymentSaleId" required onchange="salesManager.updatePaymentInfo()">
                                <option value="">اختر العقد</option>
                                ${sales.map(sale => {
                                    const customer = db.getById('customers', sale.customerId);
                                    const plot = db.getById('plots', sale.plotId);
                                    const payments = db.getAll('payments').filter(p => p.saleId === sale.id);
                                    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                                    const remaining = sale.totalAmount - totalPaid;
                                    
                                    return `
                                        <option value="${sale.id}" 
                                                data-remaining="${remaining}" 
                                                data-customer="${customer ? customer.name : 'غير محدد'}"
                                                data-plot="${plot ? plot.plotNumber : 'غير محدد'}"
                                                ${saleId == sale.id ? 'selected' : ''}>
                                            ${sale.contractNumber} - ${customer ? customer.name : 'غير محدد'} (متبقي: ${app.formatCurrency(remaining)})
                                        </option>
                                    `;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="paymentDate" class="form-label">تاريخ الدفع *</label>
                            <input type="date" class="form-control" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="paymentAmount" class="form-label">مبلغ الدفعة (ريال) *</label>
                            <input type="number" class="form-control" id="paymentAmount" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="paymentMethodSelect" class="form-label">طريقة الدفع *</label>
                            <select class="form-control" id="paymentMethodSelect" required>
                                <option value="">اختر طريقة الدفع</option>
                                <option value="نقدي">نقدي</option>
                                <option value="تحويل بنكي">تحويل بنكي</option>
                                <option value="شيك">شيك</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="receiptNumber" class="form-label">رقم الإيصال</label>
                            <input type="text" class="form-control" id="receiptNumber" value="REC-${Date.now()}">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3" id="paymentInfo" style="display: none;">
                    <div class="alert alert-info">
                        <strong>معلومات العقد:</strong>
                        <div id="paymentInfoContent"></div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="paymentNotes" class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="paymentNotes" rows="2"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-success">تسجيل الدفعة</button>
                </div>
            </form>
        `;

        app.openModal('تسجيل دفعة جديدة', formHTML);

        // تحديث معلومات الدفعة عند اختيار العقد
        if (saleId) {
            setTimeout(() => {
                this.updatePaymentInfo();
            }, 100);
        }

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addPaymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPayment();
        });
    }

    // تحديث معلومات الدفعة
    updatePaymentInfo() {
        const saleSelect = document.getElementById('paymentSaleId');
        const selectedOption = saleSelect.options[saleSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const remaining = parseFloat(selectedOption.dataset.remaining);
            const customer = selectedOption.dataset.customer;
            const plot = selectedOption.dataset.plot;
            
            document.getElementById('paymentAmount').max = remaining;
            document.getElementById('paymentAmount').value = remaining;
            
            document.getElementById('paymentInfoContent').innerHTML = `
                العميل: ${customer}<br>
                القطعة: ${plot}<br>
                المبلغ المتبقي: ${app.formatCurrency(remaining)}
            `;
            document.getElementById('paymentInfo').style.display = 'block';
        } else {
            document.getElementById('paymentInfo').style.display = 'none';
        }
    }

    // إضافة دفعة جديدة
    addPayment() {
        const saleId = parseInt(document.getElementById('paymentSaleId').value);
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        
        // التحقق من المبلغ
        const sale = db.getById('sales', saleId);
        const existingPayments = db.getAll('payments').filter(p => p.saleId === saleId);
        const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = sale.totalAmount - totalPaid;
        
        if (amount > remaining) {
            app.showAlert('مبلغ الدفعة أكبر من المبلغ المتبقي', 'danger');
            return;
        }

        const paymentData = {
            saleId: saleId,
            amount: amount,
            paymentDate: document.getElementById('paymentDate').value,
            paymentMethod: document.getElementById('paymentMethodSelect').value,
            receiptNumber: document.getElementById('receiptNumber').value,
            notes: document.getElementById('paymentNotes').value
        };

        db.add('payments', paymentData);

        // تحديث حالة البيع إذا تم السداد بالكامل
        const newTotalPaid = totalPaid + amount;
        if (newTotalPaid >= sale.totalAmount) {
            db.update('sales', saleId, { status: 'completed' });
        }

        app.closeModal();
        app.showAlert('تم تسجيل الدفعة بنجاح', 'success');
        this.render();
    }

    // عرض تفاصيل بيع
    viewSale(saleId) {
        const sale = db.getById('sales', saleId);
        const customer = db.getById('customers', sale.customerId);
        const plot = db.getById('plots', sale.plotId);
        const land = db.getById('lands', plot.landId);
        const payments = db.getAll('payments').filter(p => p.saleId === saleId);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        
        if (!sale) return;

        const viewHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>معلومات البيع</h6>
                    <table class="table table-borderless">
                        <tr><td><strong>رقم العقد:</strong></td><td>${sale.contractNumber}</td></tr>
                        <tr><td><strong>العميل:</strong></td><td>${customer ? customer.name : 'غير محدد'}</td></tr>
                        <tr><td><strong>القطعة:</strong></td><td>${plot ? plot.plotNumber : 'غير محدد'}</td></tr>
                        <tr><td><strong>الأرض:</strong></td><td>${land ? land.name : 'غير محدد'}</td></tr>
                        <tr><td><strong>تاريخ البيع:</strong></td><td>${app.formatDate(sale.saleDate)}</td></tr>
                        <tr><td><strong>المبلغ الإجمالي:</strong></td><td>${app.formatCurrency(sale.totalAmount)}</td></tr>
                        <tr><td><strong>المبلغ المدفوع:</strong></td><td class="text-success">${app.formatCurrency(totalPaid)}</td></tr>
                        <tr><td><strong>المبلغ المتبقي:</strong></td><td class="text-warning">${app.formatCurrency(sale.totalAmount - totalPaid)}</td></tr>
                        <tr><td><strong>طريقة الدفع:</strong></td><td>${sale.paymentMethod || 'غير محدد'}</td></tr>
                    </table>
                    ${sale.notes ? `<p><strong>ملاحظات:</strong><br>${sale.notes}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>تاريخ الدفعات</h6>
                    ${payments.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>المبلغ</th>
                                        <th>الطريقة</th>
                                        <th>رقم الإيصال</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.map(payment => `
                                        <tr>
                                            <td>${app.formatDate(payment.paymentDate)}</td>
                                            <td>${app.formatCurrency(payment.amount)}</td>
                                            <td>${payment.paymentMethod}</td>
                                            <td>${payment.receiptNumber}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">لا توجد دفعات مسجلة</p>'}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                ${sale.totalAmount > totalPaid ? `
                    <button type="button" class="btn btn-success" onclick="salesManager.showPaymentForm(${sale.id})">
                        <i class="fas fa-credit-card"></i>
                        إضافة دفعة
                    </button>
                ` : ''}
                <button type="button" class="btn btn-info" onclick="salesManager.printContract(${sale.id})">
                    <i class="fas fa-print"></i>
                    طباعة العقد
                </button>
            </div>
        `;

        app.openModal(`تفاصيل البيع: ${sale.contractNumber}`, viewHTML);
    }

    // طباعة العقد
    printContract(saleId) {
        const sale = db.getById('sales', saleId);
        const customer = db.getById('customers', sale.customerId);
        const plot = db.getById('plots', sale.plotId);
        const land = db.getById('lands', plot.landId);
        const payments = db.getAll('payments').filter(p => p.saleId === saleId);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        const contractHTML = `
            <div class="contract-print" id="contractToPrint">
                <div class="text-center mb-4">
                    <h2>عقد بيع قطعة أرض</h2>
                    <h4>رقم العقد: ${sale.contractNumber}</h4>
                </div>
                
                <div class="row mb-4">
                    <div class="col-6">
                        <h5>بيانات المشتري:</h5>
                        <p>
                            <strong>الاسم:</strong> ${customer.name}<br>
                            <strong>الهاتف:</strong> ${customer.phone}<br>
                            <strong>رقم الهوية:</strong> ${customer.nationalId || 'غير محدد'}<br>
                            <strong>العنوان:</strong> ${customer.address || 'غير محدد'}
                        </p>
                    </div>
                    <div class="col-6">
                        <h5>بيانات القطعة:</h5>
                        <p>
                            <strong>رقم القطعة:</strong> ${plot.plotNumber}<br>
                            <strong>الأرض:</strong> ${land.name}<br>
                            <strong>الموقع:</strong> ${land.location}<br>
                            <strong>المساحة:</strong> ${app.formatNumber(plot.area)} م²
                        </p>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-12">
                        <h5>التفاصيل المالية:</h5>
                        <table class="table table-bordered">
                            <tr><td><strong>سعر المتر المربع:</strong></td><td>${app.formatCurrency(plot.pricePerMeter)}</td></tr>
                            <tr><td><strong>المساحة:</strong></td><td>${app.formatNumber(plot.area)} م²</td></tr>
                            <tr><td><strong>المبلغ الإجمالي:</strong></td><td><strong>${app.formatCurrency(sale.totalAmount)}</strong></td></tr>
                            <tr><td><strong>المبلغ المدفوع:</strong></td><td class="text-success">${app.formatCurrency(totalPaid)}</td></tr>
                            <tr><td><strong>المبلغ المتبقي:</strong></td><td class="text-warning">${app.formatCurrency(sale.totalAmount - totalPaid)}</td></tr>
                        </table>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-12">
                        <p><strong>تاريخ العقد:</strong> ${app.formatDate(sale.saleDate)}</p>
                        ${sale.notes ? `<p><strong>ملاحظات:</strong> ${sale.notes}</p>` : ''}
                    </div>
                </div>
                
                <div class="row mt-5">
                    <div class="col-6 text-center">
                        <p>توقيع المشتري<br>_________________</p>
                    </div>
                    <div class="col-6 text-center">
                        <p>توقيع البائع<br>_________________</p>
                    </div>
                </div>
            </div>
        `;

        app.openModal(`عقد البيع: ${sale.contractNumber}`, contractHTML);
        
        // إضافة زر الطباعة
        setTimeout(() => {
            const modalFooter = document.querySelector('#dataModal .modal-footer');
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('contractToPrint')">
                    <i class="fas fa-print"></i>
                    طباعة العقد
                </button>
            `;
        }, 100);
    }

    // الحصول على إجمالي المدفوعات
    getTotalPayments() {
        const payments = db.getAll('payments');
        return payments.reduce((sum, payment) => sum + payment.amount, 0);
    }

    // الحصول على إجمالي المبالغ المتبقية
    getTotalOutstanding() {
        const sales = db.getAll('sales');
        const payments = db.getAll('payments');
        
        return sales.reduce((sum, sale) => {
            const salePayments = payments.filter(p => p.saleId === sale.id);
            const totalPaid = salePayments.reduce((pSum, p) => pSum + p.amount, 0);
            return sum + (sale.totalAmount - totalPaid);
        }, 0);
    }
}

// إنشاء مثيل من مدير المبيعات
const salesManager = new SalesManager();
