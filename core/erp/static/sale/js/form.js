var tblProducts;
var tblSearchProducts;

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
                {"data": "full_name"},
                {"data": "modelo"},
                {"data": "stock"},
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
                    targets: [-4],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<span class="badge badge-secondary">'+data+'</span>';
                    }
                },
                {
                    targets: [-5],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<label class="small">' + row.modelo + '</label>';
                    }
                },
                {
                    targets: [-6],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<label class="small">' + row.name + '</label>';
                    }
                },
                {
                    targets: [-3],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        //return '$'+parseFloat(data).toFixed(2);
                        //return '<input type="number" name="pvp" min="0" step="any" class="form-control form-control-sm input-sm inputNum" autocomplete="off" value="' + row.pvp + '" input onClick="this.select();">';
                        return '<input type="text" name="pvp" class="form-control form-control-sm input-sm inputNum" autocomplete="off" value="' + row.pvp + '" style="width: 150px;">';
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
                    //max: data.stock,
                    step: 1
                });
                $(row).find('input[name="pvp"]').TouchSpin({
                    min: 1,
                    max: 10000000,
                    decimals: 2,
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

    if (!Number.isInteger(repo.id)) {
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
        '<b>Nombre:</b> ' + repo.full_name + '<br>' +
        '<b>Stock:</b> ' + repo.stock + '<br>' +
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

    //*********** SOLUCIÓN PROFESOR ****************///
    var input_datejoined = $('input[name="date_joined"]');

    input_datejoined.datetimepicker({
        useCurrent: false,
        format: 'DD-MM-YYYY',
        locale: 'es',
        keepOpen: false,
    });

    input_datejoined.datetimepicker('date', input_datejoined.val());
    //*****************************************************

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

    //Search clients
    $('select[name="cli"]').select2({
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
                    action: 'search_clients'
                }

                return queryParameters;
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese una descripción',
        minimumInputLength: 1
    });

    $('.btnAddClient').on('click', function () {
        $('#myModalClient').modal('show');
    });

    $('#myModalClient').on('hidden.bs.modal', function (e) {
        $('#frmClient').trigger('reset');
    })

    $('#frmClient').on('submit', function (e) {
        e.preventDefault();
        var parameters = new FormData(this);
        parameters.append('action', 'create_client');
        submit_with_ajax(window.location.pathname, 'Notificación',
            '¿Estas seguro de crear al siguiente cliente?', parameters, function (response) {
                //console.log(response)
                var newOption = new Option(response.full_name, response.id, false, true);
                $('select[name="cli"]').append(newOption).trigger('change');
                $('#myModalClient').modal('hide');
            });
    });

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
        }, function () {

        });
    });

    // event cant y pvp
    $('#tblProducts tbody')
        .on('click', 'a[rel="remove"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            alert_action('Notificación', '¿Seguro en eliminar todos los items del detalle?', function () {
                vents.items.products.splice(tr.row, 1);
                vents.list();
            }, function () {

            });
        })
        .on('change keyup', 'input[name="cant"]', function () {
            var cant = parseInt($(this).val());
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            vents.items.products[tr.row].cant = cant;
            vents.calculate_invoice();
            $('td:eq(6)', tblProducts.row(tr.row).node()).html('$' + vents.items.products[tr.row].subtotal.toFixed(2));
        }).on('change keyup', 'input[name="pvp"]', function () {
            var pvp = parseInt($(this).val());
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            vents.items.products[tr.row].pvp = pvp;
            vents.calculate_invoice();
            $('td:eq(6)', tblProducts.row(tr.row).node()).html('$' + vents.items.products[tr.row].subtotal.toFixed(2));
        });


    // event pvp
    // $('#tblProducts tbody').on('change keyup', 'input[name="pvp"]', function () {
    //     if (Number.isNaN(this.valueAsNumber)) {
    //         this.value = 0;
    //     }
    //     var pvp = parseFloat($(this).val());
    //     var tr = tblProducts.cell($(this).closest('td, li')).index();
    //     vents.items.products[tr.row].pvp = pvp;
    //     vents.calculate_invoice();
    //     $('td:eq(6)', tblProducts.row(tr.row).node()).html('$' + vents.items.products[tr.row].subtotal.toFixed(2));
    // });

    $('.btnClearSearch').on('click', function () {
        $('input[name="search"]').val('').focus();
    });

    $('.btnSearchProducts').on('click', function () {
        tblSearchProducts = $('#tblSearchProducts').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'search_products',
                    'term': $('select[name="search"]').val()
                },
                dataSrc: ""
            },
            columns: [
                {"data": "full_name"},
                {"data": "image"},
                {"data": "stock"},
                {"data": "pvp"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-4],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<img src="' + data + '" class="img-fluid d-block mx-auto" style="width: 20px; height: 20px;">';
                    }
                },
                {
                    targets: [-3],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<span class="badge badge-secondary">'+data+'</span>';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<a rel="add" class="btn btn-success btn-xs btn-flat"><i class="fas fa-plus"></i></a> ';
                        return buttons;
                    }
                },
            ],
            initComplete: function (settings, json) {

            }
        });
        $('#myModalSearchProducts').modal('show');
    });

    $('#tblSearchProducts tbody')
        .on('click', 'a[rel="add"]', function () {
            var tr = tblSearchProducts.cell($(this).closest('td, li')).index();
            var product = tblSearchProducts.row(tr.row).data();
            product.cant = 1;
            product.subtotal = 0.00;
            vents.add(product);
            tblSearchProducts.row($(this).parents('tr')).remove().draw();
        });

    //$('#myModalSearchProducts').modal('show');

    //event submit
    $('#frmSale').on('submit', function (e) {
        e.preventDefault();

        if (vents.items.products.length === 0) {
            message_error('Debe al menos tener un item en su detalle de venta.');
            return false;
        }
        //date: moment().format("YYYY-MM-DD"),
        var xfec = $('input[name="date_joined"]').val();
        xfec = moment().format("YYYY-MM-DD")
        vents.items.date_joined = xfec
        vents.items.cli = $('select[name="cli"]').val();

        var parameters = new FormData();
        parameters.append('action', $('input[name="action"]').val());
        parameters.append('vents', JSON.stringify(vents.items));
        submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de guardar el siguiente registro?', parameters, function (response) {
            alert_action('Notificación', '¿Desea imprimir la factura de venta?', function () {
                window.open('/erp/sale/invoice/pdf/' + response.id + '/', '_blank');
                location.href = '/erp/sale/list/';
            }, function () {
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
                    action: 'search_autocomplete'
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
        if(!Number.isInteger(data.id)){
            return false;
        }
        data.cant = 1;
        data.subtotal = 0.00;
        vents.add(data);
        $(this).val('').trigger('change.select2');
    });

    // Esto se puso aqui para que funcione bien el editar y calcule bien los valores del iva. // sino tomaría el valor del iva de la base debe
    // coger el que pusimos al inicializarlo.
    vents.list();
});