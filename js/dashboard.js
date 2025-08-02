// إدارة لوحة التحكم
class DashboardManager {
    constructor() {
        this.charts = {};
    }

    // عرض لوحة التحكم
    render() {
        const stats = db.getStats();
        const dashboardHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-tachometer-alt"></i>
                        لوحة التحكم
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-outline-primary" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="btn btn-outline-secondary" onclick="document.getElementById('importFile').click()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importData(this)">
                    </div>
                </div>
            </div>

            <!-- إحصائيات سريعة -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-map"></i>
                        </div>
                        <div class="stats-number">${stats.totalLands}</div>
                        <div class="stats-label">إجمالي الأراضي</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-th-large"></i>
                        </div>
                        <div class="stats-number">${stats.totalPlots}</div>
                        <div class="stats-label">إجمالي القطع</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stats-number">${stats.totalCustomers}</div>
                        <div class="stats-label">إجمالي العملاء</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="stats-number">${stats.soldPlots}</div>
                        <div class="stats-label">القطع المباعة</div>
                    </div>
                </div>
            </div>

            <!-- إحصائيات مالية -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <div class="text-success">
                                <i class="fas fa-dollar-sign fa-2x"></i>
                            </div>
                            <div class="h4 mt-2 text-success">${app.formatCurrency(stats.totalSales)}</div>
                            <div class="text-muted">إجمالي المبيعات</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <div class="text-info">
                                <i class="fas fa-credit-card fa-2x"></i>
                            </div>
                            <div class="h4 mt-2 text-info">${app.formatCurrency(stats.totalPayments)}</div>
                            <div class="text-muted">المدفوعات المحصلة</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-warning">
                        <div class="card-body text-center">
                            <div class="text-warning">
                                <i class="fas fa-receipt fa-2x"></i>
                            </div>
                            <div class="h4 mt-2 text-warning">${app.formatCurrency(stats.totalExpenses)}</div>
                            <div class="text-muted">إجمالي المصروفات</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <div class="text-primary">
                                <i class="fas fa-chart-line fa-2x"></i>
                            </div>
                            <div class="h4 mt-2 text-primary">${app.formatCurrency(stats.netProfit)}</div>
                            <div class="text-muted">صافي الربح</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الرسوم البيانية -->
            <div class="row mb-4">
                <div class="col-xl-8 col-lg-7">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-line"></i>
                                نظرة عامة على المبيعات
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="salesChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-4 col-lg-5">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-pie"></i>
                                توزيع القطع
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="plotsChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الإجراءات السريعة -->
            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-bolt"></i>
                                الإجراءات السريعة
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-primary w-100" onclick="landsManager.showAddForm()">
                                        <i class="fas fa-plus"></i>
                                        إضافة أرض جديدة
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-success w-100" onclick="customersManager.showAddForm()">
                                        <i class="fas fa-user-plus"></i>
                                        إضافة عميل جديد
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-info w-100" onclick="salesManager.showAddForm()">
                                        <i class="fas fa-handshake"></i>
                                        تسجيل بيع جديد
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-warning w-100" onclick="expensesManager.showAddForm()">
                                        <i class="fas fa-receipt"></i>
                                        تسجيل مصروف
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- آخر العمليات -->
            <div class="row">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-clock"></i>
                                آخر المبيعات
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="recentSales"></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-exclamation-triangle"></i>
                                تنبيهات مهمة
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="alerts"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dashboard').innerHTML = dashboardHTML;
        
        // رسم الرسوم البيانية
        setTimeout(() => {
            this.renderCharts(stats);
            this.loadRecentSales();
            this.loadAlerts();
        }, 100);
    }

    // رسم الرسوم البيانية
    renderCharts(stats) {
        // رسم بياني للمبيعات
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            this.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المبيعات (ريال)',
                        data: this.getMonthlySalesData(),
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // رسم بياني دائري للقطع
        const plotsCtx = document.getElementById('plotsChart');
        if (plotsCtx) {
            this.charts.plots = new Chart(plotsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['متاحة', 'محجوزة', 'مباعة'],
                    datasets: [{
                        data: [stats.availablePlots, stats.reservedPlots, stats.soldPlots],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#dc3545'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
    }

    // الحصول على بيانات المبيعات الشهرية
    getMonthlySalesData() {
        const sales = db.getAll('sales');
        const monthlyData = new Array(6).fill(0);
        
        sales.forEach(sale => {
            const saleDate = new Date(sale.saleDate);
            const monthIndex = saleDate.getMonth();
            if (monthIndex >= 0 && monthIndex < 6) {
                monthlyData[monthIndex] += sale.totalAmount;
            }
        });
        
        return monthlyData;
    }

    // تحميل آخر المبيعات
    loadRecentSales() {
        const sales = db.getAll('sales');
        const recentSales = sales.slice(-5).reverse();
        
        let html = '';
        if (recentSales.length > 0) {
            recentSales.forEach(sale => {
                const customer = db.getById('customers', sale.customerId);
                const plot = db.getById('plots', sale.plotId);
                html += `
                    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                            <strong>${customer ? customer.name : 'غير محدد'}</strong><br>
                            <small class="text-muted">قطعة ${plot ? plot.plotNumber : 'غير محدد'}</small>
                        </div>
                        <div class="text-end">
                            <div class="text-success">${app.formatCurrency(sale.totalAmount)}</div>
                            <small class="text-muted">${app.formatDate(sale.saleDate)}</small>
                        </div>
                    </div>
                `;
            });
        } else {
            html = '<p class="text-muted text-center">لا توجد مبيعات حديثة</p>';
        }
        
        document.getElementById('recentSales').innerHTML = html;
    }

    // تحميل التنبيهات
    loadAlerts() {
        const alerts = this.generateAlerts();
        let html = '';
        
        if (alerts.length > 0) {
            alerts.forEach(alert => {
                html += `
                    <div class="alert alert-${alert.type} py-2">
                        <i class="fas fa-${alert.icon}"></i>
                        ${alert.message}
                    </div>
                `;
            });
        } else {
            html = '<p class="text-muted text-center">لا توجد تنبيهات</p>';
        }
        
        document.getElementById('alerts').innerHTML = html;
    }

    // إنشاء التنبيهات
    generateAlerts() {
        const alerts = [];
        const stats = db.getStats();
        
        // تنبيه للقطع المتاحة
        if (stats.availablePlots === 0) {
            alerts.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                message: 'لا توجد قطع متاحة للبيع'
            });
        }
        
        // تنبيه للمدفوعات المتأخرة
        if (stats.outstandingAmount > 0) {
            alerts.push({
                type: 'info',
                icon: 'info-circle',
                message: `يوجد مبلغ ${app.formatCurrency(stats.outstandingAmount)} غير محصل`
            });
        }
        
        // تنبيه للأرباح
        if (stats.netProfit > 0) {
            alerts.push({
                type: 'success',
                icon: 'check-circle',
                message: `تحقيق ربح قدره ${app.formatCurrency(stats.netProfit)}`
            });
        }
        
        return alerts;
    }

    // تحديث الرسوم البيانية
    updateCharts() {
        const stats = db.getStats();
        
        if (this.charts.plots) {
            this.charts.plots.data.datasets[0].data = [
                stats.availablePlots, 
                stats.reservedPlots, 
                stats.soldPlots
            ];
            this.charts.plots.update();
        }
        
        if (this.charts.sales) {
            this.charts.sales.data.datasets[0].data = this.getMonthlySalesData();
            this.charts.sales.update();
        }
    }
}

// إنشاء مثيل من مدير لوحة التحكم
const dashboardManager = new DashboardManager();
