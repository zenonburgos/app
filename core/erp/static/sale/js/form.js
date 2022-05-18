var tblProducts;
var vents = {
    items: {
        cli: '',
        date_joined: '',
        subtotal: '',
        iva: '',
        total: '',
        products: []
    },
    calculate_invoice: function () {
        var subtotal = 0.00;
        var iva = $('input[name="iva"]').val();
        $.each(this.items.products, function (pos, dict) {
            // console.log(pos)
            // console.log(dict)
            dict.subtotal = dict.cant * parseFloat(dict.pvp);
            subtotal += dict.subtotal;
        });
        this.items.subtotal = subtotal;
        this.items.iva = this.items.subtotal * iva;
        this.items.total = this.items.subtotal + this.items.iva;

        $('input[name="subtotal"]').val(this.items.subtotal.toFixed(2));
        $('input[name="ivacalc"]').val(this.items.iva.toFixed(2));
        $('input[name="total"]').val(this.items.total.toFixed(2));
    },
    add: function (item) {
        this.items.products.push(item);
        this.list();
    },
    list: function () {
        this.calculate_invoice();

        tblProducts = $('#tblProducts').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            data: this.items.products,
            columns: [
                {"data": "id"},
                {"data": "name"},
                // {"data": "cat.name"},
                {"data": "modelo"},
                {"data": "pvp"},
                {"data": "cant"},
                {"data": "subtotal"},
            ],
            columnDefs: [
                {
                    targets: [0],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<a rel="remove" class="btn btn-danger btn-sm" style="color: white;"><i class="fas fa-times"></i></a>';
                    }
                },
                {
                    targets: [-3], //columna 3
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        // return '$'+parseFloat(data).toFixed(2);
                        return '<input type="number" name="pvp" min="0" step="any" class="form-control form-control-sm input-sm inputNum" autocomplete="off" value="' + row.pvp + '" input onClick="this.select();">';
                    }
                },
                {
                    targets: [-4],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<label class="small">' + row.modelo + '</label>';
                    }
                },
                {
                    targets: [-5],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<label class="small">' + row.name + '</label>';
                    }
                },
                {
                    targets: [-2], //columna 2
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<input type="text" name="cant" class="form-control form-control-sm input-sm inputNum" autocomplete="off" value="' + row.cant + '">';
                    }
                },
                {
                    targets: [-1], //columna 1 (de atras para adelante)
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {
                $(row).find('input[name="cant"]').TouchSpin({
                    min: 1,
                    max: 10000000,
                    step: 1
                });

            },
            initComplete: function (settings, json) {

            }
        });
    }
};

function formatRepo(repo) {
    if (repo.loading) {
        return repo.text;
    }

    var option = $(
        '<div class="wrapper container">' +
        '<div class="row">' +
        '<div class="col-lg-1">' +
        '<img src="' + repo.image + '" class="img-fluid img-thumbnail d-block mx-auto rounded">' +
        '</div>' +
        '<div class="col-lg-11 text-left shadow-sm">' +
        //'<br>' +
        '<p style="margin-bottom: 0;">' +
        '<b>Nombre:</b> ' + repo.name + '<br>' +
        '<b>Categoría:</b> ' + repo.cat.name + '<br>' +
        '<b>PVP:</b> <span class="badge badge-warning">$' + repo.pvp + '</span>' +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>');

    return option;
}

$(function () {
    $('.select2').select2({
        //theme: "bootstrap4",
        language: 'es'
    });

    $('#date_joined').datetimepicker({
        format: 'YYYY-MM-DD',
        date: moment().format("YYYY-MM-DD"),
        locale: 'es',
        //minDate: moment().format("YYYY-MM-DD"),
        maxDate: moment().format("YYYY-MM-DD"),
    });

    $("input[name='iva']").TouchSpin({
        min: 0,
        max: 100,
        step: 0.01,
        decimals: 2,
        boostat: 5,
        maxboostedstep: 10,
        postfix: '%'
    }).on('change', function () {
        // console.clear()
        // console.log($(this).val());
        vents.calculate_invoice();
    }).val(0.13);

    // Search products
    /*$('input[name="search"]').autocomplete({
        source: function (request, response) {
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'search_products',
                    'term': request.term
                },
                dataType: 'json',
            }).done(function (data) {
                response(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                {

                }
            }).always(function (data) {

            });
        },
        delay: 500,
        minLength: 1,
        select: function (event, ui) {
            event.preventDefault();
            //console.clear();
            ui.item.cant = 1;
            ui.item.subtotal = 0.00;
            console.log(vents.items);
            vents.add(ui.item);
            $(this).val('');
        }
    });*/

    $('.btnRemoveAll').on('click', function () {
        if (vents.items.products.length === 0) return false;
        alert_action('Notificación', '¿Seguro en eliminar todos los items del detalle?', function () {
            vents.items.products = [];
            vents.list();
        }, function(){

        });
    });

    // event cant
    $('#tblProducts tbody')
        .on('click', 'a[rel="remove"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            alert_action('Notificación', '¿Seguro en eliminar todos los items del detalle?', function () {
                vents.items.products.splice(tr.row, 1);
                vents.list();
            }, function(){

            });
        })
        .on('change keyup', 'input[name="cant"]', function () {
            var cant = parseInt($(this).val());
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            vents.items.products[tr.row].cant = cant;
            vents.calculate_invoice();
            $('td:eq(5)', tblProducts.row(tr.row).node()).html('$' + vents.items.products[tr.row].subtotal.toFixed(2));
        });

    // event pvp
    $('#tblProducts tbody').on('change keyup', 'input[name="pvp"]', function () {
        if (Number.isNaN(this.valueAsNumber)) {
            this.value = 0;
        }
        var pvp = parseFloat($(this).val());
        var tr = tblProducts.cell($(this).closest('td, li')).index();
        vents.items.products[tr.row].pvp = pvp;
        vents.calculate_invoice();
        $('td:eq(5)', tblProducts.row(tr.row).node()).html('$' + vents.items.products[tr.row].subtotal.toFixed(2));
    });

    $('.btnClearSearch').on('click', function () {
        $('input[name="search"]').val('').focus();
    });

    //event submit
    $('form').on('submit', function (e) {
        e.preventDefault();

        if (vents.items.products.length === 0) {
            message_error('Debe al menos tener un item en su detalle de venta.');
            return false;
        }

        vents.items.date_joined = $('input[name="date_joined"]').val();
        vents.items.cli = $('select[name="cli"]').val();

        var parameters = new FormData();
        parameters.append('action', $('input[name="action"]').val());
        parameters.append('vents', JSON.stringify(vents.items));
        submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de guardar el siguiente registro?', parameters, function (response) {
            alert_action('Notificación', '¿Desea imprimir la factura de venta?', function(){
                window.open('/erp/sale/invoice/pdf/'+response.id+'/', '_blank');
                location.href = '/erp/sale/list/';
            }, function (){
                location.href = '/erp/sale/list/';
            });
        });
    });
    // vents.list();

    $('select[name="search"]').select2({
        //theme: "bootstrap4",
        language: 'es',
        //allowClear: true, //no funciona con mi actual select2
        ajax: {
            delay: 250,
            type: 'POST',
            url: window.location.pathname,
            data: function (params) {
                var queryParameters = {
                    term: params.term,
                    action: 'search_products'
                }
                return queryParameters;
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese una palabra clave de búsqueda',
        minimumInputLength: 1,
        templateResult: formatRepo
    }).on('select2:select', function (e) {
        var data = e.params.data;
        data.cant = 1;
        data.subtotal = 0.00;
        vents.add(data);
        $(this).val('').trigger('change.select2');
    });
});