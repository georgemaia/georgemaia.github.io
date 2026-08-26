// CsvToHtmlTable - Renderizador Robusto com Suporte a DataTables e Bootstrap 5
var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || (typeof FULLURL !== 'undefined' ? FULLURL : "https://raw.githubusercontent.com/georgemaia/certificados-repo/main/files/certificados.csv");
        var el = options.element || "table-container";
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};

        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $containerElement = $("#" + el);
        if ($containerElement.length === 0) return;

        function parseCsvData(csvText) {
            if (typeof Papa !== 'undefined') {
                var res = Papa.parse(csvText, { skipEmptyLines: true });
                return res.data;
            }
            if (typeof $.csv !== 'undefined' && typeof $.csv.toArrays === 'function') {
                return $.csv.toArrays(csvText, options.csv_options || {});
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
            return rows;
        }

        fetch(csv_path)
            .then(function (response) {
                if (!response.ok) throw new Error("Erro de rede: " + response.status);
                return response.text();
            })
            .then(function (csvDataText) {
                var csvData = parseCsvData(csvDataText);
                if (!csvData || csvData.length === 0) {
                    $containerElement.html("<div class='alert alert-warning text-center'>Nenhum registro encontrado no arquivo de dados.</div>");
                    return;
                }

                var $table = $("<table class='table table-dark table-hover table-striped table-sm align-middle w-100' id='" + el + "-table'></table>");
                $containerElement.empty().append($table);

                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];
                var $tableHeadRow = $("<tr></tr>");

                var headerMap = {
                    "Issuer": "Emissor / Instituição",
                    "Certificate": "Certificado / Curso",
                    "Workload (h)": "Carga (h)",
                    "Conclusion": "Conclusão",
                    "File": "Arquivo",
                    "Keywords": "Tags / Palavras-chave"
                };

                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    var originalHeader = csvHeaderRow[headerIdx].trim();
                    var displayHeader = headerMap[originalHeader] || originalHeader;
                    $tableHeadRow.append($("<th class='text-nowrap'></th>").text(displayHeader));
                }
                $tableHead.append($tableHeadRow);
                $table.append($tableHead);

                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var row = csvData[rowIdx];
                    if (!row || row.length === 0 || (row.length === 1 && row[0] === "")) continue;

                    var $tableBodyRow = $("<tr></tr>");
                    for (var colIdx = 0; colIdx < csvHeaderRow.length; colIdx++) {
                        var cellVal = (colIdx < row.length) ? row[colIdx] : "";
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];

                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(cellVal));
                        } else {
                            $tableBodyRowTd.text(cellVal);
                        }
                        $tableBodyRow.append($tableBodyRowTd);
                    }
                    $tableBody.append($tableBodyRow);
                }
                $table.append($tableBody);

                if ($.fn.DataTable) {
                    $table.DataTable(datatables_options);
                }
            })
            .catch(function (err) {
                console.error("Erro ao carregar tabela de certificados:", err);
                $containerElement.html("<div class='alert alert-danger text-center'>Não foi possível carregar a tabela de certificados neste momento.</div>");
            });
    }
};
