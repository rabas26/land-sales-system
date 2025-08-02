// إدارة الخرائط والمخططات
class MapsManager {
    constructor() {
        this.map = null;
        this.drawingMode = false;
        this.currentDrawing = null;
        this.markers = [];
        this.polygons = [];
    }

    // عرض واجهة الخرائط
    render() {
        const lands = db.getAll('lands');
        const plots = db.getAll('plots');
        
        const mapsHTML = `
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>
                        <i class="fas fa-globe"></i>
                        الخرائط والمخططات
                    </h1>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="mapsManager.toggleDrawingMode()">
                            <i class="fas fa-pencil-alt"></i>
                            <span id="drawingModeBtn">تفعيل الرسم</span>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="mapsManager.clearDrawings()">
                            <i class="fas fa-eraser"></i>
                            مسح الرسوم
                        </button>
                        <button class="btn btn-outline-info" onclick="mapsManager.exportMap()">
                            <i class="fas fa-download"></i>
                            تصدير الخريطة
                        </button>
                    </div>
                </div>
            </div>

            <!-- أدوات الخريطة -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body py-2">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <label for="landSelect" class="form-label mb-0">اختر الأرض:</label>
                                    <select class="form-control form-control-sm" id="landSelect" onchange="mapsManager.focusOnLand(this.value)">
                                        <option value="">جميع الأراضي</option>
                                        ${lands.map(land => `
                                            <option value="${land.id}">${land.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="plotFilter" class="form-label mb-0">تصفية القطع:</label>
                                    <select class="form-control form-control-sm" id="plotFilter" onchange="mapsManager.filterPlots(this.value)">
                                        <option value="all">جميع القطع</option>
                                        <option value="available">المتاحة فقط</option>
                                        <option value="sold">المباعة فقط</option>
                                        <option value="reserved">المحجوزة فقط</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <div class="btn-group btn-group-sm w-100" role="group">
                                        <button class="btn btn-outline-primary" onclick="mapsManager.zoomIn()">
                                            <i class="fas fa-search-plus"></i>
                                        </button>
                                        <button class="btn btn-outline-primary" onclick="mapsManager.zoomOut()">
                                            <i class="fas fa-search-minus"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary" onclick="mapsManager.resetView()">
                                            <i class="fas fa-home"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الخريطة -->
            <div class="row">
                <div class="col-lg-9">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-map-marked-alt"></i>
                                خريطة الأراضي والقطع
                            </h5>
                        </div>
                        <div class="card-body p-0">
                            <div id="map" class="map-container"></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3">
                    <!-- معلومات الخريطة -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-info-circle"></i>
                                معلومات الخريطة
                            </h6>
                        </div>
                        <div class="card-body">
                            <div id="mapInfo">
                                <p><strong>إجمالي الأراضي:</strong> ${lands.length}</p>
                                <p><strong>إجمالي القطع:</strong> ${plots.length}</p>
                                <p><strong>القطع المتاحة:</strong> ${plots.filter(p => p.status === 'available').length}</p>
                                <p><strong>القطع المباعة:</strong> ${plots.filter(p => p.status === 'sold').length}</p>
                            </div>
                        </div>
                    </div>

                    <!-- أدوات الرسم -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-tools"></i>
                                أدوات الرسم
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="mapsManager.drawRectangle()">
                                    <i class="fas fa-square"></i>
                                    رسم مستطيل
                                </button>
                                <button class="btn btn-outline-primary btn-sm" onclick="mapsManager.drawPolygon()">
                                    <i class="fas fa-draw-polygon"></i>
                                    رسم مضلع
                                </button>
                                <button class="btn btn-outline-primary btn-sm" onclick="mapsManager.drawCircle()">
                                    <i class="fas fa-circle"></i>
                                    رسم دائرة
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" onclick="mapsManager.addMarker()">
                                    <i class="fas fa-map-pin"></i>
                                    إضافة علامة
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- طبقات الخريطة -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-layers"></i>
                                طبقات الخريطة
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showLands" checked onchange="mapsManager.toggleLayer('lands', this.checked)">
                                <label class="form-check-label" for="showLands">عرض الأراضي</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showPlots" checked onchange="mapsManager.toggleLayer('plots', this.checked)">
                                <label class="form-check-label" for="showPlots">عرض القطع</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showSoldPlots" checked onchange="mapsManager.toggleLayer('soldPlots', this.checked)">
                                <label class="form-check-label" for="showSoldPlots">عرض القطع المباعة</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showLabels" checked onchange="mapsManager.toggleLayer('labels', this.checked)">
                                <label class="form-check-label" for="showLabels">عرض التسميات</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('maps').innerHTML = mapsHTML;
        
        // تهيئة الخريطة
        setTimeout(() => {
            this.initializeMap();
        }, 100);
    }

    // تهيئة الخريطة
    initializeMap() {
        // إنشاء الخريطة
        this.map = L.map('map').setView([24.7136, 46.6753], 12);

        // إضافة طبقة الخريطة الأساسية
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // إضافة طبقة الخريطة الفضائية
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri'
        });

        // إضافة تحكم في الطبقات
        const baseMaps = {
            "خريطة عادية": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            "خريطة فضائية": satelliteLayer
        };

        L.control.layers(baseMaps).addTo(this.map);

        // تحميل البيانات على الخريطة
        this.loadLandsOnMap();
        this.loadPlotsOnMap();

        // إعداد أحداث الخريطة
        this.map.on('click', (e) => {
            if (this.drawingMode) {
                this.handleMapClick(e);
            }
        });
    }

    // تحميل الأراضي على الخريطة
    loadLandsOnMap() {
        const lands = db.getAll('lands');
        
        lands.forEach(land => {
            if (land.coordinates) {
                try {
                    const coords = JSON.parse(land.coordinates);
                    if (Array.isArray(coords) && coords.length === 2) {
                        const marker = L.marker([coords[0], coords[1]])
                            .addTo(this.map)
                            .bindPopup(`
                                <div class="text-center">
                                    <h6>${land.name}</h6>
                                    <p class="mb-1">${land.location}</p>
                                    <p class="mb-1">المساحة: ${app.formatNumber(land.totalArea)} م²</p>
                                    <button class="btn btn-sm btn-primary" onclick="landsManager.viewLand(${land.id})">
                                        عرض التفاصيل
                                    </button>
                                </div>
                            `);
                        
                        this.markers.push({
                            type: 'land',
                            id: land.id,
                            marker: marker
                        });
                    }
                } catch (e) {
                    console.error('خطأ في تحليل إحداثيات الأرض:', land.id);
                }
            }
        });
    }

    // تحميل القطع على الخريطة
    loadPlotsOnMap() {
        const plots = db.getAll('plots');
        
        plots.forEach(plot => {
            if (plot.coordinates) {
                try {
                    const coords = JSON.parse(plot.coordinates);
                    if (Array.isArray(coords) && coords.length === 2) {
                        const color = this.getPlotColor(plot.status);
                        const land = db.getById('lands', plot.landId);
                        
                        const marker = L.circleMarker([coords[0], coords[1]], {
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.7,
                            radius: 8
                        })
                        .addTo(this.map)
                        .bindPopup(`
                            <div class="text-center">
                                <h6>قطعة ${plot.plotNumber}</h6>
                                <p class="mb-1">الأرض: ${land ? land.name : 'غير محدد'}</p>
                                <p class="mb-1">المساحة: ${app.formatNumber(plot.area)} م²</p>
                                <p class="mb-1">السعر: ${app.formatCurrency(plot.totalPrice)}</p>
                                <span class="status-badge status-${plot.status}">
                                    ${this.getStatusText(plot.status)}
                                </span><br>
                                <button class="btn btn-sm btn-primary mt-2" onclick="plotsManager.viewPlot(${plot.id})">
                                    عرض التفاصيل
                                </button>
                            </div>
                        `);
                        
                        this.markers.push({
                            type: 'plot',
                            id: plot.id,
                            marker: marker,
                            status: plot.status
                        });
                    }
                } catch (e) {
                    console.error('خطأ في تحليل إحداثيات القطعة:', plot.id);
                }
            }
        });
    }

    // الحصول على لون القطعة حسب الحالة
    getPlotColor(status) {
        const colors = {
            'available': '#28a745',
            'reserved': '#ffc107',
            'sold': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    // التركيز على أرض معينة
    focusOnLand(landId) {
        if (!landId) {
            this.resetView();
            return;
        }

        const land = db.getById('lands', landId);
        if (land && land.coordinates) {
            try {
                const coords = JSON.parse(land.coordinates);
                this.map.setView([coords[0], coords[1]], 15);
            } catch (e) {
                console.error('خطأ في إحداثيات الأرض');
            }
        }
    }

    // تصفية القطع على الخريطة
    filterPlots(status) {
        this.markers.forEach(item => {
            if (item.type === 'plot') {
                if (status === 'all' || item.status === status) {
                    this.map.addLayer(item.marker);
                } else {
                    this.map.removeLayer(item.marker);
                }
            }
        });
    }

    // تفعيل/إلغاء وضع الرسم
    toggleDrawingMode() {
        this.drawingMode = !this.drawingMode;
        const btn = document.getElementById('drawingModeBtn');
        
        if (this.drawingMode) {
            btn.textContent = 'إلغاء الرسم';
            btn.parentElement.classList.remove('btn-primary');
            btn.parentElement.classList.add('btn-warning');
            this.map.getContainer().style.cursor = 'crosshair';
            app.showAlert('وضع الرسم مفعل - انقر على الخريطة لبدء الرسم', 'info');
        } else {
            btn.textContent = 'تفعيل الرسم';
            btn.parentElement.classList.remove('btn-warning');
            btn.parentElement.classList.add('btn-primary');
            this.map.getContainer().style.cursor = '';
        }
    }

    // رسم مستطيل
    drawRectangle() {
        if (!this.drawingMode) {
            this.toggleDrawingMode();
        }
        
        app.showAlert('انقر واسحب لرسم مستطيل', 'info');
        
        // تفعيل رسم المستطيل
        this.map.on('mousedown', this.startRectangleDraw.bind(this));
    }

    // بدء رسم المستطيل
    startRectangleDraw(e) {
        const startLatLng = e.latlng;
        let rectangle;
        
        const onMouseMove = (e) => {
            if (rectangle) {
                this.map.removeLayer(rectangle);
            }
            
            const bounds = L.latLngBounds(startLatLng, e.latlng);
            rectangle = L.rectangle(bounds, {
                color: '#007bff',
                fillOpacity: 0.3
            }).addTo(this.map);
        };
        
        const onMouseUp = (e) => {
            this.map.off('mousemove', onMouseMove);
            this.map.off('mouseup', onMouseUp);
            
            if (rectangle) {
                this.saveDrawing('rectangle', rectangle.getBounds());
            }
        };
        
        this.map.on('mousemove', onMouseMove);
        this.map.on('mouseup', onMouseUp);
    }

    // رسم دائرة
    drawCircle() {
        if (!this.drawingMode) {
            this.toggleDrawingMode();
        }
        
        app.showAlert('انقر على نقطة المركز ثم اسحب لتحديد نصف القطر', 'info');
        
        this.map.on('mousedown', this.startCircleDraw.bind(this));
    }

    // بدء رسم الدائرة
    startCircleDraw(e) {
        const center = e.latlng;
        let circle;
        
        const onMouseMove = (e) => {
            if (circle) {
                this.map.removeLayer(circle);
            }
            
            const radius = center.distanceTo(e.latlng);
            circle = L.circle(center, {
                radius: radius,
                color: '#28a745',
                fillOpacity: 0.3
            }).addTo(this.map);
        };
        
        const onMouseUp = (e) => {
            this.map.off('mousemove', onMouseMove);
            this.map.off('mouseup', onMouseUp);
            
            if (circle) {
                this.saveDrawing('circle', {
                    center: center,
                    radius: center.distanceTo(e.latlng)
                });
            }
        };
        
        this.map.on('mousemove', onMouseMove);
        this.map.on('mouseup', onMouseUp);
    }

    // إضافة علامة
    addMarker() {
        app.showAlert('انقر على الخريطة لإضافة علامة', 'info');
        
        const addMarkerHandler = (e) => {
            const marker = L.marker(e.latlng)
                .addTo(this.map)
                .bindPopup(`
                    <div class="text-center">
                        <h6>علامة جديدة</h6>
                        <p>الإحداثيات: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}</p>
                        <button class="btn btn-sm btn-danger" onclick="mapsManager.removeMarker(this)">
                            حذف العلامة
                        </button>
                    </div>
                `);
            
            this.markers.push({
                type: 'custom',
                marker: marker
            });
            
            this.map.off('click', addMarkerHandler);
        };
        
        this.map.on('click', addMarkerHandler);
    }

    // حفظ الرسم
    saveDrawing(type, data) {
        const drawing = {
            id: Date.now(),
            type: type,
            data: data,
            createdAt: new Date().toISOString()
        };
        
        // حفظ في قاعدة البيانات المحلية
        let drawings = JSON.parse(localStorage.getItem('mapDrawings') || '[]');
        drawings.push(drawing);
        localStorage.setItem('mapDrawings', JSON.stringify(drawings));
        
        app.showAlert(`تم حفظ ${type === 'rectangle' ? 'المستطيل' : type === 'circle' ? 'الدائرة' : 'الرسم'}`, 'success');
    }

    // مسح جميع الرسوم
    clearDrawings() {
        if (app.confirmDelete('هل أنت متأكد من مسح جميع الرسوم؟')) {
            // مسح الرسوم من الخريطة
            this.polygons.forEach(polygon => {
                this.map.removeLayer(polygon);
            });
            this.polygons = [];
            
            // مسح الرسوم من التخزين
            localStorage.removeItem('mapDrawings');
            
            app.showAlert('تم مسح جميع الرسوم', 'success');
        }
    }

    // تكبير الخريطة
    zoomIn() {
        this.map.zoomIn();
    }

    // تصغير الخريطة
    zoomOut() {
        this.map.zoomOut();
    }

    // إعادة تعيين العرض
    resetView() {
        this.map.setView([24.7136, 46.6753], 12);
    }

    // تصدير الخريطة
    exportMap() {
        // هذه الوظيفة تتطلب مكتبة إضافية لتصدير الخريطة كصورة
        app.showAlert('ميزة تصدير الخريطة قيد التطوير', 'info');
    }

    // إظهار/إخفاء طبقة
    toggleLayer(layerType, show) {
        this.markers.forEach(item => {
            if (layerType === 'lands' && item.type === 'land') {
                if (show) {
                    this.map.addLayer(item.marker);
                } else {
                    this.map.removeLayer(item.marker);
                }
            } else if (layerType === 'plots' && item.type === 'plot') {
                if (show) {
                    this.map.addLayer(item.marker);
                } else {
                    this.map.removeLayer(item.marker);
                }
            }
        });
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

// إنشاء مثيل من مدير الخرائط
const mapsManager = new MapsManager();
