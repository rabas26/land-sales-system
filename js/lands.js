// إدارة الأراضي
class LandsManager {
    constructor() {
        this.currentLand = null;
    }

    // عرض قائمة الأراضي
    render() {
        const lands = db.getAll('lands');
        const landsHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-map"></i>
                        إدارة الأراضي
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="landsManager.showAddForm()">
                            <i class="fas fa-plus"></i>
                            إضافة أرض جديدة
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-list"></i>
                        قائمة الأراضي (${lands.length})
                    </h5>
                </div>
                <div class="card-body">
                    ${this.renderLandsTable(lands)}
                </div>
            </div>
        `;

        document.getElementById('lands').innerHTML = landsHTML;
    }

    // عرض جدول الأراضي
    renderLandsTable(lands) {
        if (lands.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-map fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد أراضي مسجلة</h5>
                    <p class="text-muted">ابدأ بإضافة أرض جديدة لبدء استخدام النظام</p>
                    <button class="btn btn-primary" onclick="landsManager.showAddForm()">
                        <i class="fas fa-plus"></i>
                        إضافة أرض جديدة
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
                            <th>اسم الأرض</th>
                            <th>الموقع</th>
                            <th>المساحة الإجمالية (م²)</th>
                            <th>عدد القطع</th>
                            <th>تاريخ الإضافة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        lands.forEach(land => {
            const plots = db.getAll('plots').filter(p => p.landId === land.id);
            tableHTML += `
                <tr>
                    <td>${land.id}</td>
                    <td><strong>${land.name}</strong></td>
                    <td>${land.location}</td>
                    <td>${app.formatNumber(land.totalArea)}</td>
                    <td><span class="badge bg-info">${plots.length}</span></td>
                    <td>${app.formatDate(land.createdAt)}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="landsManager.viewLand(${land.id})">
                                <i class="fas fa-eye"></i>
                                عرض
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="landsManager.showEditForm(${land.id})">
                                <i class="fas fa-edit"></i>
                                تعديل
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="landsManager.deleteLand(${land.id})">
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

    // عرض نموذج إضافة أرض
    showAddForm() {
        const formHTML = `
            <form id="addLandForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="landName" class="form-label">اسم الأرض *</label>
                            <input type="text" class="form-control" id="landName" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="landLocation" class="form-label">الموقع *</label>
                            <input type="text" class="form-control" id="landLocation" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="landArea" class="form-label">المساحة الإجمالية (م²) *</label>
                            <input type="number" class="form-control" id="landArea" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="landCoordinates" class="form-label">الإحداثيات (اختياري)</label>
                            <input type="text" class="form-control" id="landCoordinates" placeholder="24.7136, 46.6753">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="landDescription" class="form-label">الوصف</label>
                    <textarea class="form-control" id="landDescription" rows="3"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ الأرض</button>
                </div>
            </form>
        `;

        app.openModal('إضافة أرض جديدة', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('addLandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLand();
        });
    }

    // إضافة أرض جديدة
    addLand() {
        const landData = {
            name: document.getElementById('landName').value,
            location: document.getElementById('landLocation').value,
            totalArea: parseFloat(document.getElementById('landArea').value),
            coordinates: document.getElementById('landCoordinates').value,
            description: document.getElementById('landDescription').value
        };

        const newLand = db.add('lands', landData);
        app.closeModal();
        app.showAlert('تم إضافة الأرض بنجاح', 'success');
        this.render();
    }

    // عرض نموذج تعديل أرض
    showEditForm(landId) {
        const land = db.getById('lands', landId);
        if (!land) return;

        const formHTML = `
            <form id="editLandForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editLandName" class="form-label">اسم الأرض *</label>
                            <input type="text" class="form-control" id="editLandName" value="${land.name}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editLandLocation" class="form-label">الموقع *</label>
                            <input type="text" class="form-control" id="editLandLocation" value="${land.location}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editLandArea" class="form-label">المساحة الإجمالية (م²) *</label>
                            <input type="number" class="form-control" id="editLandArea" value="${land.totalArea}" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="editLandCoordinates" class="form-label">الإحداثيات (اختياري)</label>
                            <input type="text" class="form-control" id="editLandCoordinates" value="${land.coordinates}" placeholder="24.7136, 46.6753">
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="editLandDescription" class="form-label">الوصف</label>
                    <textarea class="form-control" id="editLandDescription" rows="3">${land.description || ''}</textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-primary">حفظ التعديلات</button>
                </div>
            </form>
        `;

        app.openModal('تعديل الأرض', formHTML);

        // إعداد مستمع الحدث للنموذج
        document.getElementById('editLandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateLand(landId);
        });
    }

    // تحديث أرض
    updateLand(landId) {
        const updatedData = {
            name: document.getElementById('editLandName').value,
            location: document.getElementById('editLandLocation').value,
            totalArea: parseFloat(document.getElementById('editLandArea').value),
            coordinates: document.getElementById('editLandCoordinates').value,
            description: document.getElementById('editLandDescription').value
        };

        db.update('lands', landId, updatedData);
        app.closeModal();
        app.showAlert('تم تحديث الأرض بنجاح', 'success');
        this.render();
    }

    // عرض تفاصيل أرض
    viewLand(landId) {
        const land = db.getById('lands', landId);
        const plots = db.getAll('plots').filter(p => p.landId === landId);
        
        if (!land) return;

        const viewHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>معلومات الأرض</h6>
                    <table class="table table-borderless">
                        <tr><td><strong>الاسم:</strong></td><td>${land.name}</td></tr>
                        <tr><td><strong>الموقع:</strong></td><td>${land.location}</td></tr>
                        <tr><td><strong>المساحة:</strong></td><td>${app.formatNumber(land.totalArea)} م²</td></tr>
                        <tr><td><strong>الإحداثيات:</strong></td><td>${land.coordinates || 'غير محدد'}</td></tr>
                        <tr><td><strong>تاريخ الإضافة:</strong></td><td>${app.formatDate(land.createdAt)}</td></tr>
                    </table>
                    ${land.description ? `<p><strong>الوصف:</strong><br>${land.description}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h6>إحصائيات القطع</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-primary">${plots.length}</h4>
                                    <small>إجمالي القطع</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-success">${plots.filter(p => p.status === 'available').length}</h4>
                                    <small>قطع متاحة</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-warning">${plots.filter(p => p.status === 'reserved').length}</h4>
                                    <small>قطع محجوزة</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-danger">${plots.filter(p => p.status === 'sold').length}</h4>
                                    <small>قطع مباعة</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${plots.length > 0 ? `
                <hr>
                <h6>قطع الأرض</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>رقم القطعة</th>
                                <th>المساحة</th>
                                <th>السعر الإجمالي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${plots.map(plot => `
                                <tr>
                                    <td>${plot.plotNumber}</td>
                                    <td>${app.formatNumber(plot.area)} م²</td>
                                    <td>${app.formatCurrency(plot.totalPrice)}</td>
                                    <td>
                                        <span class="status-badge status-${plot.status}">
                                            ${this.getStatusText(plot.status)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">لا توجد قطع مسجلة لهذه الأرض</p>'}
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="plotsManager.showAddForm(${landId})">
                    <i class="fas fa-plus"></i>
                    إضافة قطعة جديدة
                </button>
            </div>
        `;

        app.openModal(`تفاصيل الأرض: ${land.name}`, viewHTML);
    }

    // حذف أرض
    deleteLand(landId) {
        const land = db.getById('lands', landId);
        const plots = db.getAll('plots').filter(p => p.landId === landId);
        
        if (!land) return;

        if (plots.length > 0) {
            if (!app.confirmDelete(`هذه الأرض تحتوي على ${plots.length} قطعة. هل أنت متأكد من الحذف؟ سيتم حذف جميع القطع المرتبطة بها.`)) {
                return;
            }
            
            // حذف جميع القطع المرتبطة
            plots.forEach(plot => {
                db.delete('plots', plot.id);
            });
        } else {
            if (!app.confirmDelete('هل أنت متأكد من حذف هذه الأرض؟')) {
                return;
            }
        }

        db.delete('lands', landId);
        app.showAlert('تم حذف الأرض بنجاح', 'success');
        this.render();
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

    // البحث في الأراضي
    searchLands(searchTerm) {
        const results = db.search('lands', searchTerm, ['name', 'location', 'description']);
        return this.renderLandsTable(results);
    }
}

// إنشاء مثيل من مدير الأراضي
const landsManager = new LandsManager();
