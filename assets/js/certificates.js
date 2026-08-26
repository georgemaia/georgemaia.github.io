// certificates.js - Inicializador do DataTables para Certificados
$(document).ready(function () {
    var serverUrl = (typeof SERVER !== 'undefined')
        ? SERVER
        : "https://raw.githubusercontent.com/georgemaia/certificados-repo/main/files/";

    var csvFullUrl = (typeof FULLURL !== 'undefined')
        ? FULLURL
        : serverUrl + "certificados.csv";

    function format_pdf_link(link) {
        if (link && link.trim() !== "") {
            var cleanLink = link.trim().replace(/^"|"$/g, '');
            var fullPdfUrl = cleanLink.startsWith('http') ? cleanLink : serverUrl + cleanLink;
            return "<a href='" + fullPdfUrl + "' target='_blank' class='badge bg-danger text-white p-2 d-inline-flex align-items-center gap-1 text-decoration-none' title='Visualizar / Baixar Certificado em PDF'>" +
                   "<i class='fas fa-file-pdf'></i> PDF" +
                   "</a>";
        }
        return "<span class='text-muted small'>—</span>";
    }

    function format_keywords(keywords) {
        if (!keywords || keywords.trim() === "") return "";
        var cleanKeywords = keywords.trim().replace(/^"|"$/g, '');
        var tags = cleanKeywords.split(",");
        var html = "<div class='d-flex flex-wrap gap-1'>";
        tags.forEach(function (tag) {
            var t = tag.trim();
            if (t.length > 0) {
                html += "<span class='badge bg-secondary bg-opacity-25 text-info border border-info border-opacity-25' style='font-size: 0.72rem;'>" + t + "</span>";
            }
        });
        html += "</div>";
        return html;
    }

    function format_workload(hours) {
        if (!hours || isNaN(parseFloat(hours))) return hours || "—";
        return "<span class='badge bg-dark border border-secondary text-white font-monospace'>" + hours + " h</span>";
    }

    CsvToHtmlTable.init({
        csv_path: csvFullUrl,
        element: "table-container",
        datatables_options: {
            paging: true,
            pageLength: 10,
            responsive: true,
            order: [[3, 'desc']], // Ordenar pela data de conclusão decrescente
            language: {
                search: "Buscar:",
                searchPlaceholder: "Pesquisar certificado, emissor, ano, tag...",
                lengthMenu: "Exibir _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ certificados",
                infoEmpty: "Nenhum certificado disponível",
                infoFiltered: "(filtrado de _MAX_ no total)",
                zeroRecords: "Nenhum certificado encontrado para os critérios de busca.",
                paginate: {
                    first: "<i class='fas fa-angles-left'></i>",
                    last: "<i class='fas fa-angles-right'></i>",
                    next: "<i class='fas fa-chevron-right'></i>",
                    previous: "<i class='fas fa-chevron-left'></i>"
                }
            }
        },
        custom_formatting: [
            [2, format_workload],
            [4, format_pdf_link],
            [5, format_keywords]
        ]
    });
});