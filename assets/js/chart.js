var urlConfig = "config.js";

$.getScript(urlConfig, function(){
    $(document).ready(function() {
        $.ajax({
        // Ler o conteúdo do CSV e iniciar o processamento

        url: FULLURL,
        dataType: 'text',
        success: function(data) {
            parseCSV(data);
        }
        });
    });
});

// Função para ler o CSV e processar os dados
function parseCSV(csvData) {
    var rows = csvData.split('\n');
    var headers = rows[0].split(',');
    var data = [];

    for (var i = 1; i < rows.length; i++) {
        var rowData = rows[i].split(',');
        var rowObject = {};

        for (var j = 0; j < headers.length; j++) {
            // rowObject[headers[j].trim()] = rowData[j].trim();
            if (j < rowData.length) {
                rowObject[headers[j].trim()] = rowData[j].trim();
            } else {
                // Handle cases where the row has fewer columns than headers (optional)
                // For example, you could assign an empty string or a default value
                rowObject[headers[j].trim()] = "";
            }
        }

        data.push(rowObject);
    }

    // Processar e criar o gráfico com os dados
    createChart(data);
}

// Função para agrupar dados por ano e criar o gráfico
function createChart(data) {
    var dataByYear = {};

    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var conclusionDate = new Date(row["Conclusion"]);
        // var year = new Date(row["Conclusion"]).getFullYear();

        if (!isNaN(conclusionDate.getTime())) {
            var year = conclusionDate.getFullYear();

            if (!dataByYear[year]) {
                dataByYear[year] = {
                    count: 0,
                    hours: 0,
                };
            }

            dataByYear[year].count++;
            dataByYear[year].hours += parseFloat(row["Workload (h)"]);
        }
    }

    var chartData = {
        labels: Object.keys(dataByYear),
        datasets: [
        {
            label: "Total de Horas",
            data: Object.values(dataByYear).map(function (yearData) {
            return yearData.hours;
            }),
        },
        ],
    };

    var ctx = document.getElementById("chart").getContext("2d");
    var chart = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
            // responsive: true,
            // height: "300px"
        },
    });
}