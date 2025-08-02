// إدارة التقارير
class ReportsManager {
    constructor() {
        this.charts = {};
    }

    // عرض واجهة التقارير
    render() {
        const stats = db.getStats();
        const reportsHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-chart-bar"></i>
                        التقارير والإحصائيات
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="reportsManager.generateFullReport()">
                            <i class="fas fa-file-alt"></i>
                            تقرير شامل
                        </button>
                        <button class="btn btn-outline-success" onclick="reportsManager.exportReports()">
                            <i class="fas fa-download"></i>
                            تصدير التقارير
                        </button>
                    </div>
                </div>
            </div>

            <!-- تقارير سريعة -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-chart-line fa-2x text-primary mb-2"></i>
                            <h5>تقرير المبيعات</h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="reportsManager.showSalesReport()">
                                عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-receipt fa-2x text-danger mb-2"></i>
                            <h5>تقرير المصروفات</h5>
                            <button class="btn btn-outline-danger btn-sm" onclick="reportsManager.showExpensesReport()">
                                عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-chart-pie fa-2x text-success mb-2"></i>
                            <h5>تقرير الأرباح</h5>
                            <button class="btn btn-outline-success btn-sm" onclick="reportsManager.showProfitReport()">
                                عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <i class="fas fa-map fa-2x text-info mb-2"></i>
                            <h5>تقرير القطع</h5>
                            <button class="btn btn-outline-info btn-sm" onclick="reportsManager.showPlotsReport()">
                                عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الرسوم البيانية الرئيسية -->
            <div class="row mb-4">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-area"></i>
                                تطور المبيعات والمصروفات
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="salesExpensesChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-pie"></i>
                                توزيع الإيرادات
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إحصائيات تفصيلية -->
            <div class="row">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-calculator"></i>
                                الملخص المالي
                            </h5>
                        </div>
                        <div class="card-body">
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>إجمالي المبيعات:</strong></td>
                                    <td class="text-end"><strong>${app.formatCurrency(stats.totalSales)}</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>المدفوعات المحصلة:</strong></td>
                                    <td class="text-end text-success"><strong>${app.formatCurrency(stats.totalPayments)}</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>المبالغ المتبقية:</strong></td>
                                    <td class="text-end text-warning"><strong>${app.formatCurrency(stats.outstandingAmount)}</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>إجمالي المصروفات:</strong></td>
                                    <td class="text-end text-danger"><strong>${app.formatCurrency(stats.totalExpenses)}</strong></td>
                                </tr>
                                <tr class="table-info">
                                    <td><strong>صافي الربح:</strong></td>
                                    <td class="text-end"><strong class="${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}">${app.formatCurrency(stats.netProfit)}</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-bar"></i>
                                إحصائيات القطع
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="plotsStatusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('reports').innerHTML = reportsHTML;
        
        // رسم الرسوم البيانية
        setTimeout(() => {
            this.renderCharts(stats);
        }, 100);
    }

    // رسم الرسوم البيانية
    renderCharts(stats) {
        // رسم بياني للمبيعات والمصروفات
        const salesExpensesCtx = document.getElementById('salesExpensesChart');
        if (salesExpensesCtx) {
            const monthlyData = this.getMonthlyData();
            
            this.charts.salesExpenses = new Chart(salesExpensesCtx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المبيعات',
                        data: monthlyData.sales,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.1,
                        fill: true
                    }, {
                        label: 'المصروفات',
                        data: monthlyData.expenses,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
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

        // رسم بياني للإيرادات
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'doughnut',
                data: {
                    labels: ['المدفوعات المحصلة', 'المبالغ المتبقية'],
                    datasets: [{
                        data: [stats.totalPayments, stats.outstandingAmount],
                        backgroundColor: ['#28a745', '#ffc107']
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

        // رسم بياني لحالة القطع
        const plotsStatusCtx = document.getElementById('plotsStatusChart');
        if (plotsStatusCtx) {
            this.charts.plotsStatus = new Chart(plotsStatusCtx, {
                type: 'bar',
                data: {
                    labels: ['متاحة', 'محجوزة', 'مباعة'],
                    datasets: [{
                        label: 'عدد القطع',
                        data: [stats.availablePlots, stats.reservedPlots, stats.soldPlots],
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
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
    }

    // الحصول على البيانات الشهرية
    getMonthlyData() {
        const sales = db.getAll('sales');
        const expenses = db.getAll('expenses');
        
        const monthlySales = new Array(6).fill(0);
        const monthlyExpenses = new Array(6).fill(0);
        
        // حساب المبيعات الشهرية
        sales.forEach(sale => {
            const saleDate = new Date(sale.saleDate);
            const monthIndex = saleDate.getMonth();
            if (monthIndex >= 0 && monthIndex < 6) {
                monthlySales[monthIndex] += sale.totalAmount;
            }
        });
        
        // حساب المصروفات الشهرية
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.expenseDate);
            const monthIndex = expenseDate.getMonth();
            if (monthIndex >= 0 && monthIndex < 6) {
                monthlyExpenses[monthIndex] += expense.amount;
            }
        });
        
        return {
            sales: monthlySales,
            expenses: monthlyExpenses
        };
    }

    // عرض تقرير المبيعات
    showSalesReport() {
        const sales = db.getAll('sales');
        const payments = db.getAll('payments');
        
        const reportHTML = `
            <div id="salesReportContent">
                <h4 class="text-center mb-4">تقرير المبيعات التفصيلي</h4>
                
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-primary">${sales.length}</h5>
                                <small>عدد المبيعات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-success">${app.formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0))}</h5>
                                <small>إجمالي المبيعات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-info">${app.formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</h5>
                                <small>المحصل</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>رقم العقد</th>
                                <th>العميل</th>
                                <th>القطعة</th>
                                <th>تاريخ البيع</th>
                                <th>المبلغ الإجمالي</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.map(sale => {
                                const customer = db.getById('customers', sale.customerId);
                                const plot = db.getById('plots', sale.plotId);
                                const salePayments = payments.filter(p => p.saleId === sale.id);
                                const totalPaid = salePayments.reduce((sum, p) => sum + p.amount, 0);
                                
                                return `
                                    <tr>
                                        <td>${sale.contractNumber}</td>
                                        <td>${customer ? customer.name : 'غير محدد'}</td>
                                        <td>${plot ? plot.plotNumber : 'غير محدد'}</td>
                                        <td>${app.formatDate(sale.saleDate)}</td>
                                        <td>${app.formatCurrency(sale.totalAmount)}</td>
                                        <td class="text-success">${app.formatCurrency(totalPaid)}</td>
                                        <td class="text-warning">${app.formatCurrency(sale.totalAmount - totalPaid)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="table-info">
                                <td colspan="4"><strong>الإجمالي:</strong></td>
                                <td><strong>${app.formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0))}</strong></td>
                                <td><strong class="text-success">${app.formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</strong></td>
                                <td><strong class="text-warning">${app.formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0) - payments.reduce((sum, p) => sum + p.amount, 0))}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('salesReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('تقرير المبيعات', reportHTML);
    }

    // عرض تقرير المصروفات
    showExpensesReport() {
        const expenses = db.getAll('expenses');
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        const reportHTML = `
            <div id="expensesReportContent">
                <h4 class="text-center mb-4">تقرير المصروفات التفصيلي</h4>
                
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-primary">${expenses.length}</h5>
                                <small>عدد المصروفات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-danger">${app.formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</h5>
                                <small>إجمالي المصروفات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-info">${Object.keys(categoryTotals).length}</h5>
                                <small>عدد الفئات</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h6>المصروفات حسب الفئة:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الفئة</th>
                                <th>عدد المصروفات</th>
                                <th>المبلغ الإجمالي</th>
                                <th>النسبة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(categoryTotals).map(([category, total]) => {
                                const categoryExpenses = expenses.filter(e => e.category === category);
                                const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
                                const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr>
                                        <td>${category}</td>
                                        <td>${categoryExpenses.length}</td>
                                        <td>${app.formatCurrency(total)}</td>
                                        <td>${percentage}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <h6>تفاصيل المصروفات:</h6>
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الفئة</th>
                                <th>الوصف</th>
                                <th>المبلغ</th>
                                <th>الأرض</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenses.map(expense => {
                                const land = expense.landId ? db.getById('lands', expense.landId) : null;
                                return `
                                    <tr>
                                        <td>${app.formatDate(expense.expenseDate)}</td>
                                        <td>${expense.category}</td>
                                        <td>${expense.description}</td>
                                        <td>${app.formatCurrency(expense.amount)}</td>
                                        <td>${land ? land.name : 'عام'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('expensesReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('تقرير المصروفات', reportHTML);
    }

    // عرض تقرير الأرباح
    showProfitReport() {
        const stats = db.getStats();
        const monthlyData = this.getMonthlyData();
        const monthlyProfit = monthlyData.sales.map((sales, index) => sales - monthlyData.expenses[index]);

        const reportHTML = `
            <div id="profitReportContent">
                <h4 class="text-center mb-4">تقرير الأرباح</h4>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-success">${app.formatCurrency(stats.totalPayments)}</h5>
                                <small>إجمالي الإيرادات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-danger">${app.formatCurrency(stats.totalExpenses)}</h5>
                                <small>إجمالي المصروفات</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}">${app.formatCurrency(stats.netProfit)}</h5>
                                <small>صافي الربح</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-info">${stats.totalPayments > 0 ? ((stats.netProfit / stats.totalPayments) * 100).toFixed(1) : 0}%</h5>
                                <small>هامش الربح</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h6>الأرباح الشهرية:</h6>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الشهر</th>
                                <th>الإيرادات</th>
                                <th>المصروفات</th>
                                <th>صافي الربح</th>
                                <th>هامش الربح</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'].map((month, index) => {
                                const revenue = monthlyData.sales[index];
                                const expense = monthlyData.expenses[index];
                                const profit = revenue - expense;
                                const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr>
                                        <td>${month}</td>
                                        <td class="text-success">${app.formatCurrency(revenue)}</td>
                                        <td class="text-danger">${app.formatCurrency(expense)}</td>
                                        <td class="${profit >= 0 ? 'text-success' : 'text-danger'}">${app.formatCurrency(profit)}</td>
                                        <td>${margin}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('profitReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('تقرير الأرباح', reportHTML);
    }

    // عرض تقرير القطع
    showPlotsReport() {
        const plots = db.getAll('plots');
        const lands = db.getAll('lands');
        
        const landStats = lands.map(land => {
            const landPlots = plots.filter(p => p.landId === land.id);
            const available = landPlots.filter(p => p.status === 'available').length;
            const sold = landPlots.filter(p => p.status === 'sold').length;
            const reserved = landPlots.filter(p => p.status === 'reserved').length;
            
            return {
                land: land,
                total: landPlots.length,
                available: available,
                sold: sold,
                reserved: reserved,
                totalValue: landPlots.reduce((sum, p) => sum + p.totalPrice, 0),
                soldValue: landPlots.filter(p => p.status === 'sold').reduce((sum, p) => sum + p.totalPrice, 0)
            };
        });

        const reportHTML = `
            <div id="plotsReportContent">
                <h4 class="text-center mb-4">تقرير القطع والأراضي</h4>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-primary">${plots.length}</h5>
                                <small>إجمالي القطع</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-success">${plots.filter(p => p.status === 'available').length}</h5>
                                <small>قطع متاحة</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-danger">${plots.filter(p => p.status === 'sold').length}</h5>
                                <small>قطع مباعة</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="text-warning">${plots.filter(p => p.status === 'reserved').length}</h5>
                                <small>قطع محجوزة</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h6>تفاصيل الأراضي:</h6>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم الأرض</th>
                                <th>إجمالي القطع</th>
                                <th>متاحة</th>
                                <th>محجوزة</th>
                                <th>مباعة</th>
                                <th>القيمة الإجمالية</th>
                                <th>قيمة المباع</th>
                                <th>نسبة البيع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${landStats.map(stat => {
                                const salePercentage = stat.total > 0 ? ((stat.sold / stat.total) * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr>
                                        <td>${stat.land.name}</td>
                                        <td>${stat.total}</td>
                                        <td class="text-success">${stat.available}</td>
                                        <td class="text-warning">${stat.reserved}</td>
                                        <td class="text-danger">${stat.sold}</td>
                                        <td>${app.formatCurrency(stat.totalValue)}</td>
                                        <td class="text-success">${app.formatCurrency(stat.soldValue)}</td>
                                        <td>${salePercentage}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('plotsReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('تقرير القطع', reportHTML);
    }

    // إنشاء تقرير شامل
    generateFullReport() {
        const stats = db.getStats();
        const sales = db.getAll('sales');
        const expenses = db.getAll('expenses');
        const customers = db.getAll('customers');
        const plots = db.getAll('plots');
        const lands = db.getAll('lands');

        const reportHTML = `
            <div id="fullReportContent">
                <div class="text-center mb-4">
                    <h2>التقرير الشامل لنظام إدارة بيع الأراضي</h2>
                    <p class="text-muted">تاريخ التقرير: ${app.formatDate(new Date().toISOString())}</p>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-12">
                        <h4>الملخص التنفيذي</h4>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5>${lands.length}</h5>
                                        <small>إجمالي الأراضي</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5>${plots.length}</h5>
                                        <small>إجمالي القطع</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5>${customers.length}</h5>
                                        <small>إجمالي العملاء</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5>${sales.length}</h5>
                                        <small>إجمالي المبيعات</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-12">
                        <h4>الملخص المالي</h4>
                        <table class="table table-bordered">
                            <tr>
                                <td><strong>إجمالي قيمة المبيعات:</strong></td>
                                <td class="text-end"><strong>${app.formatCurrency(stats.totalSales)}</strong></td>
                            </tr>
                            <tr>
                                <td><strong>المدفوعات المحصلة:</strong></td>
                                <td class="text-end text-success"><strong>${app.formatCurrency(stats.totalPayments)}</strong></td>
                            </tr>
                            <tr>
                                <td><strong>المبالغ المتبقية:</strong></td>
                                <td class="text-end text-warning"><strong>${app.formatCurrency(stats.outstandingAmount)}</strong></td>
                            </tr>
                            <tr>
                                <td><strong>إجمالي المصروفات:</strong></td>
                                <td class="text-end text-danger"><strong>${app.formatCurrency(stats.totalExpenses)}</strong></td>
                            </tr>
                            <tr class="table-info">
                                <td><strong>صافي الربح:</strong></td>
                                <td class="text-end"><strong class="${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}">${app.formatCurrency(stats.netProfit)}</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h5>حالة القطع</h5>
                        <table class="table table-sm">
                            <tr><td>قطع متاحة:</td><td class="text-success">${stats.availablePlots}</td></tr>
                            <tr><td>قطع محجوزة:</td><td class="text-warning">${stats.reservedPlots}</td></tr>
                            <tr><td>قطع مباعة:</td><td class="text-danger">${stats.soldPlots}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5>معدلات الأداء</h5>
                        <table class="table table-sm">
                            <tr><td>معدل البيع:</td><td>${plots.length > 0 ? ((stats.soldPlots / plots.length) * 100).toFixed(1) : 0}%</td></tr>
                            <tr><td>متوسط سعر القطعة:</td><td>${plots.length > 0 ? app.formatCurrency(plots.reduce((sum, p) => sum + p.totalPrice, 0) / plots.length) : 0}</td></tr>
                            <tr><td>متوسط قيمة البيع:</td><td>${sales.length > 0 ? app.formatCurrency(stats.totalSales / sales.length) : 0}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="app.printReport('fullReportContent')">
                    <i class="fas fa-print"></i>
                    طباعة التقرير
                </button>
            </div>
        `;

        app.openModal('التقرير الشامل', reportHTML);
    }

    // تصدير التقارير
    exportReports() {
        const reportData = {
            summary: db.getStats(),
            sales: db.getAll('sales'),
            expenses: db.getAll('expenses'),
            customers: db.getAll('customers'),
            plots: db.getAll('plots'),
            lands: db.getAll('lands'),
            payments: db.getAll('payments'),
            generatedAt: new Date().toISOString()
        };

        const jsonData = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `land_sales_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        app.showAlert('تم تصدير التقارير بنجاح', 'success');
    }
}

// إنشاء مثيل من مدير التقارير
const reportsManager = new ReportsManager();
