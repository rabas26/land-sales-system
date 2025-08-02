// إدارة القطع
class PlotsManager {
    constructor() {
        this.currentPlot = null;
    }

    // عرض قائمة القطع
    render() {
        const plots = db.getAll('plots');
        const plotsHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-th-large"></i>
                        إدارة القطع
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="plotsManager.showAddForm()">
                            <i class="fas fa-plus"></i>
                            إضافة قطعة جديدة
                        </button>
                        <button class="btn btn-outline-info" onclick="plotsManager.showFilterOptions()">
                            <i class="fas fa-filter"></i>
                            تصفية
                        </button>
                    </div>
                </div>
            </div>

            <!-- فلاتر سريعة -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body py-2">
                            <div class="btn-group" role="group">
                                <button class="btn btn-outline-secondary btn-sm" onclick="plotsManager.filterByStatus('all')">
                                    الكل (${plots.length})
                                </button>
                                <button class="btn btn-outline-success btn-sm" onclick="plotsManager.filterByStatus('available')">
                                    متاحة (${plots.filter(p => p.status === 'available').length})
                                </button>
                                <button class="btn btn-outline-warning btn-sm" onclick="plotsManager.filterByStatus('reserved')">
                                    محجوزة (${plots.filter(p => p.status === 'reserved').length})
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="plotsManager.filterByStatus('sold')">
                                    مباعة (${plots.filter(p => p.status === 'sold').length})
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
                        قائمة القطع
                    </h5>
                </div>
                <div class="card-body">
                    <div id="plotsTableContainer">
                        ${this.renderPlotsTable(plots)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('plots').innerHTML = plotsHTML;
    }

    // عرض جدول القطع
    renderPlotsTable(plots) {
        if (plots.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-th-large fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد قطع مسجلة</h5>
                    <p class="text-muted">ابدأ بإضافة قطعة جديدة</p>
                    <button class="btn btn-primary" onclick="plotsManager.showAddForm()">
                        <i class="fas fa-plus"></i>
                        إضافة قطعة جديدة
                    </button>
                </div>
            `;
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>رقم القطعة</th>
                            <th>الأرض</th>
                            <th>المساحة (م²)</th>
                            <th>سعر المتر</th>
                            <th>السعر الإجمالي</th>
                            <th>الحالة</th>
                            <th>تاريخ الإضافة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        plots.forEach(plot => {
            const land = db.getById('lands', plot.landId);
            tableHTML += `
                <tr>
                    <td><strong>${plot.plotNumber}</strong></td>
                    <td>${land ? land.name : 'غير محدد'}</td>
                    <td>${app.formatNumber(plot.area)}</td>
                    <td>${app.formatCurrency(plot.pricePerMeter)}</td>
                    <td><strong>${app.formatCurrency(plot.totalPrice)}</strong></td>
                    <td>
                        <span class="status-badge status-${plot.status}">
                            ${this.getStatusText(plot.status)}
                        </span>
                    </td>
                    <td>${app.formatDate(plot.createdAt)}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="plotsManager.viewPlot(${plot.id})">
                                <i class="fas fa-eye"></i>
                                عرض
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="plotsManager.showEditForm(${plot.id})">
                                <i class="fas fa-edit"></i>
                                تعديل
                            </button>
                            ${plot.status === 'available' ? `
                                <button class="btn btn-sm btn-outline-success" onclick="salesManager.showAddForm(${plot.id})">
                                    <i class="fas fa-handshake"></i>
                                    بيع
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-danger" onclick="plotsManager.deletePlot(${plot.id})">
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

    // عرض نموذج إضافة قطعة
    showAddForm(landId = null) {
        const lands = db.getAll('lands');
        
        const formHTML = `
            <form id="addPlotForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="plotLandId" class="form-label">الأرض *</label>
                            <select class="form-control" id="plotLandId" required>
                                <option value="">اختر الأرض</option>
                                ${lands.map(land => `
                                    <option value="${land.id}" ${landId == land.id ? 'selected' : ''}>
                                        ${land.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="plotNumber" class="form-label">رقم القطعة *</label>
                            <input type="text" class="form-control" id="plotNumber" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="plotArea" class="form-label">المساحة (م²) *</label>
                            <input type="number" class="form-control" id="plotArea" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="pricePerMeter" class="form-label">سعر المتر (ريال) *</label>
                            <input type="number" class="form-control" id="pricePerMeter" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="totalPrice" class="form-label">السعر الإجمالي (ريال)</label>
                            <input type="number" class="form-control" id="totalPrice" readonly>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="plotCoordinates" class="form-label">الإحداثيات (اختياري)</label>
                            <input type="text" class="form-control" id="plotCoordinates" placeholder="24.7136, 46.6753">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="plotStatus" class="form-label">الحالة</label>
                            <select class="form-control" id="plotStatus">
                                <option value="available">متاحة</option>
                                <option value="reserved">محجوزة</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="plotDescription" class="form-label">الوصف</label>
                    <textarea class="form-control" id="plotDescription" rows="3"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ القطعة</button>
                </div>
            </form>
        `;

        app.openModal('إضافة قطعة جديدة', formHTML);

        // حساب السعر الإجمالي تلقائياً
        document.getElementById('plotArea').addEventListener('input', this.calculateTotalPrice);
        document.getElementById('pricePerMeter').addEventListener('input', this.calculateTotalPrice);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addPlotForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPlot();
        });
    }

    // حساب السعر الإجمالي
    calculateTotalPrice() {
        const area = parseFloat(document.getElementById('plotArea').value) || 0;
        const pricePerMeter = parseFloat(document.getElementById('pricePerMeter').value) || 0;
        const totalPrice = area * pricePerMeter;
        document.getElementById('totalPrice').value = totalPrice;
    }

    // إضافة قطعة جديدة
    addPlot() {
        const plotData = {
            landId: parseInt(document.getElementById('plotLandId').value),
            plotNumber: document.getElementById('plotNumber').value,
            area: parseFloat(document.getElementById('plotArea').value),
            pricePerMeter: parseFloat(document.getElementById('pricePerMeter').value),
            totalPrice: parseFloat(document.getElementById('totalPrice').value),
            status: document.getElementById('plotStatus').value,
            coordinates: document.getElementById('plotCoordinates').value,
            description: document.getElementById('plotDescription').value
        };

        const newPlot = db.add('plots', plotData);
        app.closeModal();
        app.showAlert('تم إضافة القطعة بنجاح', 'success');
        this.render();
    }

    // عرض نموذج تعديل قطعة
    showEditForm(plotId) {
        const plot = db.getById('plots', plotId);
        const lands = db.getAll('lands');
        
        if (!plot) return;

        const formHTML = `
            <form id="editPlotForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editPlotLandId" class="form-label">الأرض *</label>
                            <select class="form-control" id="editPlotLandId" required>
                                ${lands.map(land => `
                                    <option value="${land.id}" ${plot.landId == land.id ? 'selected' : ''}>
                                        ${land.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editPlotNumber" class="form-label">رقم القطعة *</label>
                            <input type="text" class="form-control" id="editPlotNumber" value="${plot.plotNumber}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editPlotArea" class="form-label">المساحة (م²) *</label>
                            <input type="number" class="form-control" id="editPlotArea" value="${plot.area}" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editPricePerMeter" class="form-label">سعر المتر (ريال) *</label>
                            <input type="number" class="form-control" id="editPricePerMeter" value="${plot.pricePerMeter}" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label for="editTotalPrice" class="form-label">السعر الإجمالي (ريال)</label>
                            <input type="number" class="form-control" id="editTotalPrice" value="${plot.totalPrice}" readonly>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editPlotCoordinates" class="form-label">الإحداثيات (اختياري)</label>
                            <input type="text" class="form-control" id="editPlotCoordinates" value="${plot.coordinates}" placeholder="24.7136, 46.6753">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editPlotStatus" class="form-label">الحالة</label>
                            <select class="form-control" id="editPlotStatus">
                                <option value="available" ${plot.status === 'available' ? 'selected' : ''}>متاحة</option>
                                <option value="reserved" ${plot.status === 'reserved' ? 'selected' : ''}>محجوزة</option>
                                <option value="sold" ${plot.status === 'sold' ? 'selected' : ''}>مباعة</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="editPlotDescription" class="form-label">الوصف</label>
                    <textarea class="form-control" id="editPlotDescription" rows="3">${plot.description || ''}</textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ التعديلات</button>
                </div>
            </form>
        `;

        app.openModal('تعديل القطعة', formHTML);

        // حساب السعر الإجمالي تلقائياً
        document.getElementById('editPlotArea').addEventListener('input', this.calculateEditTotalPrice);
        document.getElementById('editPricePerMeter').addEventListener('input', this.calculateEditTotalPrice);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('editPlotForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePlot(plotId);
        });
    }

    // حساب السعر الإجمالي للتعديل
    calculateEditTotalPrice() {
        const area = parseFloat(document.getElementById('editPlotArea').value) || 0;
        const pricePerMeter = parseFloat(document.getElementById('editPricePerMeter').value) || 0;
        const totalPrice = area * pricePerMeter;
        document.getElementById('editTotalPrice').value = totalPrice;
    }

    // تحديث قطعة
    updatePlot(plotId) {
        const updatedData = {
            landId: parseInt(document.getElementById('editPlotLandId').value),
            plotNumber: document.getElementById('editPlotNumber').value,
            area: parseFloat(document.getElementById('editPlotArea').value),
            pricePerMeter: parseFloat(document.getElementById('editPricePerMeter').value),
            totalPrice: parseFloat(document.getElementById('editTotalPrice').value),
            status: document.getElementById('editPlotStatus').value,
            coordinates: document.getElementById('editPlotCoordinates').value,
            description: document.getElementById('editPlotDescription').value
        };

        db.update('plots', plotId, updatedData);
        app.closeModal();
        app.showAlert('تم تحديث القطعة بنجاح', 'success');
        this.render();
    }

    // عرض تفاصيل قطعة
    viewPlot(plotId) {
        const plot = db.getById('plots', plotId);
        const land = db.getById('lands', plot.landId);
        const sales = db.getAll('sales').filter(s => s.plotId === plotId);
        
        if (!plot) return;

        const viewHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>معلومات القطعة</h6>
                    <table class="table table-borderless">
                        <tr><td><strong>رقم القطعة:</strong></td><td>${plot.plotNumber}</td></tr>
                        <tr><td><strong>الأرض:</strong></td><td>${land ? land.name : 'غير محدد'}</td></tr>
                        <tr><td><strong>المساحة:</strong></td><td>${app.formatNumber(plot.area)} م²</td></tr>
                        <tr><td><strong>سعر المتر:</strong></td><td>${app.formatCurrency(plot.pricePerMeter)}</td></tr>
                        <tr><td><strong>السعر الإجمالي:</strong></td><td>${app.formatCurrency(plot.totalPrice)}</td></tr>
                        <tr><td><strong>الحالة:</strong></td><td>
                            <span class="status-badge status-${plot.status}">
                                ${this.getStatusText(plot.status)}
                            </span>
                        </td></tr>
                        <tr><td><strong>الإحداثيات:</strong></td><td>${plot.coordinates || 'غير محدد'}</td></tr>
                        <tr><td><strong>تاريخ الإضافة:</strong></td><td>${app.formatDate(plot.createdAt)}</td></tr>
                    </table>
                    ${plot.description ? `<p><strong>الوصف:</strong><br>${plot.description}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>معلومات البيع</h6>
                    ${sales.length > 0 ? `
                        ${sales.map(sale => {
                            const customer = db.getById('customers', sale.customerId);
                            const payments = db.getAll('payments').filter(p => p.saleId === sale.id);
                            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                            
                            return `
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <h6 class="card-title">${customer ? customer.name : 'غير محدد'}</h6>
                                        <p class="card-text">
                                            <strong>رقم العقد:</strong> ${sale.contractNumber}<br>
                                            <strong>تاريخ البيع:</strong> ${app.formatDate(sale.saleDate)}<br>
                                            <strong>المبلغ الإجمالي:</strong> ${app.formatCurrency(sale.totalAmount)}<br>
                                            <strong>المبلغ المدفوع:</strong> ${app.formatCurrency(totalPaid)}<br>
                                            <strong>المبلغ المتبقي:</strong> ${app.formatCurrency(sale.totalAmount - totalPaid)}
                                        </p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    ` : '<p class="text-muted">لم يتم بيع هذه القطعة بعد</p>'}
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                ${plot.status === 'available' ? `
                    <button type="button" class="btn btn-success" onclick="salesManager.showAddForm(${plot.id})">
                        <i class="fas fa-handshake"></i>
                        بيع القطعة
                    </button>
                ` : ''}
            </div>
        `;

        app.openModal(`تفاصيل القطعة: ${plot.plotNumber}`, viewHTML);
    }

    // حذف قطعة
    deletePlot(plotId) {
        const plot = db.getById('plots', plotId);
        if (!plot) return;

        // التحقق من وجود مبيعات مرتبطة
        const sales = db.getAll('sales').filter(s => s.plotId === plotId);
        if (sales.length > 0) {
            app.showAlert('لا يمكن حذف هذه القطعة لأنها مرتبطة بعمليات بيع', 'warning');
            return;
        }

        if (!app.confirmDelete('هل أنت متأكد من حذف هذه القطعة؟')) {
            return;
        }

        db.delete('plots', plotId);
        app.showAlert('تم حذف القطعة بنجاح', 'success');
        this.render();
    }

    // تصفية القطع حسب الحالة
    filterByStatus(status) {
        const plots = db.getAll('plots');
        const filteredPlots = status === 'all' ? plots : plots.filter(p => p.status === status);
        
        document.getElementById('plotsTableContainer').innerHTML = this.renderPlotsTable(filteredPlots);
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // الحصول على نص الحالة
    getStatusText(status) {
        const statusTexts = {
            'available': 'متاحة',
            'reserved': 'محجوزة',
            'sold': 'مباعة'
        };
        return statusTexts[status] || status;
    }
}

// إنشاء مثيل من مدير القطع
const plotsManager = new PlotsManager();
