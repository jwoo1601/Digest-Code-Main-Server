$(function() {
    $('#btn-toggle-permission-list')
        .on('mouseenter', function(e) {
            $(this).addClass('text-primary');
        })
        .on('mouseleave', function(e) {
            $(this).removeClass('text-primary');
        });

    $('#permission-list')
        .on('show.bs.collapse', function(e) {
            $('#btn-toggle-permission-list i').html(
                'keyboard_arrow_up',
            );
        })
        .on('hide.bs.collapse', function(e) {
            $('#btn-toggle-permission-list i').html(
                'keyboard_arrow_down',
            );
        });

    $('#btn-authorize').on('click', function(e) {
        $('#modal-status').modal({
            backdrop: 'static',
            keyboard: false,
        });

        $.ajax({
            url: '', //{{requestUrl}},
            method: 'POST',
            data: '', //{{requestData}}
        });
    });
});