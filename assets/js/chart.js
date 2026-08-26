// Chart.js - Analytics de Certificados por Ano
(function () {
    var csvUrl = (typeof FULLURL !== 'undefined')
        ? FULLURL
        : "https://raw.githubusercontent.com/georgemaia/certificados-repo/main/files/certificados.csv";

    function parseCsvData(csvText) {
        if (typeof Papa !== 'undefined') {
            var parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            return parsed.data;
        }

        // Fallback manual CSV parser
        var rows = [];
        var currentRow = [];
        var currentCell = '';
        var inQuotes = false;

        for (var i = 0; i < csvText.length; i++) {
            var c = csvText[i];
            if (c === '"') {
                if (inQuotes && csvText[i+1] === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c === ',' && !inQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if ((c === '\r' || c === '\n') && !inQuotes) {
                if (c === '\r' && csvText[i+1] === '\n') i++;
                currentRow.push(currentCell.trim());
                if (currentRow.some(function(cell) { return cell.length > 0; })) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += c;
            }
        }
        if (currentCell.length > 0 || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.some(function(cell) { return cell.length > 0; })) rows.push(currentRow);
        }

        if (rows.length < 2) return [];
        var headers = rows[0];
        var dataObjects = [];
        for (var r = 1; r < rows.length; r++) {
            var obj = {};
            for (var h = 0; h < headers.length; h++) {
                obj[headers[h]] = rows[r][h] || "";
            }
            dataObjects.push(obj);
        }
        return dataObjects;
    }

    function initChart() {
        var chartCanvas = document.getElementById("chart");
        if (!chartCanvas) return;

        fetch(csvUrl)
            .then(function (response) {
                if (!response.ok) throw new Error("Erro na rede: " + response.status);
                return response.text();
            })
            .then(function (csvText) {
                var data = parseCsvData(csvText);
                var dataByYear = {};

                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    var conclusion = row["Conclusion"] || row["Data"] || "";
                    var workload = parseFloat(row["Workload (h)"] || row["Workload"] || row["Horas"] || 0);

                    if (conclusion) {
                        var dateParts = conclusion.split("-");
                        var year = null;
                        if (dateParts.length >= 1 && !isNaN(parseInt(dateParts[0]))) {
                            year = parseInt(dateParts[0]);
                        } else {
                            var dateObj = new Date(conclusion);
                            if (!isNaN(dateObj.getTime())) year = dateObj.getFullYear();
                        }

                        if (year && year >= 1990 && year <= 2030) {
                            if (!dataByYear[year]) {
                                dataByYear[year] = { count: 0, hours: 0 };
                            }
                            dataByYear[year].count++;
                            dataByYear[year].hours += isNaN(workload) ? 0 : workload;
                        }
                    }
                }

                var sortedYears = Object.keys(dataByYear).sort(function (a, b) { return a - b; });
                var hoursData = sortedYears.map(function (y) { return Math.round(dataByYear[y].hours); });
                var countsData = sortedYears.map(function (y) { return dataByYear[y].count; });

                var ctx = chartCanvas.getContext("2d");

                // Gradient for bars
                var gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#38bdf8');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.4)');

                new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: sortedYears,
                        datasets: [{
                            label: "Total de Horas de Estudo",
                            data: hoursData,
                            backgroundColor: gradient,
                            borderColor: '#38bdf8',
                            borderWidth: 1.5,
                            borderRadius: 6,
                            borderSkipped: false,
                            counts: countsData
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: '#94a3b8',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 12,
                                        weight: '600'
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                titleColor: '#ffffff',
                                bodyColor: '#cbd5e1',
                                borderColor: 'rgba(56, 189, 248, 0.5)',
                                borderWidth: 1,
                                padding: 12,
                                displayColors: false,
                                callbacks: {
                                    title: function (items) {
                                        return "Ano: " + items[0].label;
                                    },
                                    label: function (context) {
                                        var idx = context.dataIndex;
                                        var hours = context.dataset.data[idx];
                                        var count = context.dataset.counts[idx];
                                        return [
                                            "⏱ Carga Horária: " + Number(hours).toLocaleString('pt-BR') + " h",
                                            "📜 Certificados Concluídos: " + count
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#94a3b8',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 11
                                    }
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#94a3b8',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 11
                                    },
                                    callback: function(val) {
                                        return val + ' h';
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch(function (err) {
                console.error("Erro ao carregar dados do gráfico:", err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChart);
    } else {
        initChart();
    }
})();