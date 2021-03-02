let debug = true

let overlayer = false

let currentEditTab = 'edit-herder-news-tab'

let editHeaderInp = $('#edit-header')
let editIconInp = $('#edit-icon')
let editDescription = $('#edit-description')
let editUrlInp = $('#edit-url')

let editWlanInps = $('.edit-wlan')
let editContactInps = $('.edit-contact')

let herderNews

loadPages()
loadHerderNews()

async function loadPages() {
    $('#viewer-pages-dynamic').empty()

    await $.ajax({
        type: 'GET',
        url: '/api/getPages',
        error: function () {
            console.error('Seiten konnten nicht geladen')
        },
        success: function (data) {
            $('#viewer-pages-loader').css('display', 'none')
            let i = 0
            data.forEach(element => {
                let backgroundimage = 'link'
                switch (element.type) {
                    case 'herder-news':
                        backgroundimage = 'news'
                        break

                    case 'cloud-link':
                        backgroundimage = 'clouds'
                        break

                    case 'link':
                        backgroundimage = 'link'
                        break

                    case 'wlan':
                        backgroundimage = 'wi-fi_good'
                        break

                    case 'contact':
                        backgroundimage = 'contact'
                        break
                }
                container = `
                <div class="viewer-page" style="background-image: url('./assets/img/icon/${backgroundimage}.svg')">
                    <div class="info">
                        <div class="num">${i + 1}.</div>
                        <div class="title">${element.header}</div>
                    </div>
                    <div class="actions">
                        <i class="material-icons" onclick="changeOverlayer()">edit</i>
                        <i class="material-icons" onclick="deletePage(${i})">delete</i>
                    </div>
                </div>`
                $('#viewer-pages-dynamic').append(container)
                i++
            });
            console.log(data)
        },
    })
}

async function deletePage(id) {
    $('#viewer-pages-dynamic').empty()
    $('#viewer-pages-loader').css('display', 'block')
    await $.ajax({
        type: 'DELETE',
        url: '/api/deletepage',
        data: { id: id },
        error: function () {
            console.error('Seiten konnte nicht gelöscht werden')
        },
        success: function (data) {
            console.log('Erfolgreich gelöscht')
        },
    })
    loadPages()
}

//Edit Overlayer

function changeOverlayer(id) {
    if (!overlayer) {
        $('.overlayer').css('display', 'block')
        overlayer = true
    } else {
        loadPages()
        $('.overlayer').css('display', 'none')
        overlayer = false
    }
}


$(document).keyup((e) => {
    if (e.key == 'Escape') {
        if (overlayer) {
            changeOverlayer()
        }
    }
})

$('.create-site-nav-tab').click(function () {
    let actedit = $('.active-creatve-tab')
    actedit.removeClass('active-creatve-tab')


    switch (actedit.attr("id")) {
        case 'edit-herder-news-tab':
            $('#herder-news-container').css('display', 'none')
            editHeaderInp.val('')
            editDescription.val('')
            editUrlInp.val('')
            editUrlInp.prop("disabled", false)
            break

        case ('edit-cloud-link-tab'):

            editUrlInp.attr('placeholder', 'https://beispiel-webseite.de/unterpfad')
            break

        case 'edit-wlan-tab':
            editUrlInp.parent().css('display', 'block')
            editWlanInps.css('display', 'none')
            break

        case 'edit-contact-tab':
            editUrlInp.parent().css('display', 'block')
            editContactInps.css('display', 'none')
            break
    }

    this.classList.add('active-creatve-tab')

    editUrlInp.val('')

    currentEditTab = this.id

    switch (this.id) {
        case 'edit-herder-news-tab':
            editIconInp.val('Herder Logo')
            editUrlInp.val('https://herder-gymnasium-minden.de')
            editUrlInp.prop("disabled", true)
            $('#herder-news-container').css('display', 'flex')
            break

        case 'edit-cloud-link-tab':
            editUrlInp.attr('placeholder', 'https://cloud.herder-gymnasium-minden.de/nxcld/index.php/')
            editIconInp.val('Cloud')
            break

        case 'edit-link-tab':
            editIconInp.val('Link')
            break

        case 'edit-wlan-tab':
            editIconInp.val('Wlan')
            editUrlInp.parent().css('display', 'none')
            editWlanInps.css('display', 'block')
            break

        case 'edit-contact-tab':
            editUrlInp.parent().css('display', 'none')
            editContactInps.css('display', 'block')
            break
    }
    console.info('Tab: ' + currentEditTab)
});

async function submitForm() {
    console.log('Send Form')

    let typeConvert = currentEditTab
    let viewerExport = {
        type: typeConvert.replaceAll('edit-', '').replaceAll('-tab', ''),
        header: editHeaderInp.val(),
        icon: editIconInp.val(),
        description: editDescription.val(),
        qrcode: editUrlInp.val()
    }

    console.log(currentEditTab)

    switch (currentEditTab) {
        case 'edit-wlan-tab':
            viewerExport.qrcode = `WIFI:S:${$('#edit-wlan-SSID').val()};` +
                `T:${$('#edit-wlan-encryption').val()};` +
                `P:${$('#edit-wlan-password').val()};` +
                `H:false;;`
            break
        // case 'edit-contact-tab':
        //     break
    }

    await $.ajax({
        type: "POST",
        url: '/api/PostView',
        data: JSON.stringify(viewerExport),
        contentType: 'application/json',
    });
    console.log('Succsess')
    changeOverlayer()
}

let activeHerderNews

async function loadHerderNews() {
    await $.ajax({
        type: 'GET',
        url: '/api/getherdernews',
        error: function () {
            console.error('Herder News konnten nicht geladen')
        },
        success: function (data) {
            $('#herder-news-loader').css('display', 'none')
            let i = 0
            data.forEach(element => {
                container = `<div id="herder-news-card-${i}" class="card herder-news-card" onclick="insertHerderNews(${i})">
                                <div class="card-body">
                                    <h5 class="card-title">${element.headline}</h5>
                                    <p class="card-text">${element.description}</p>
                                </div>
                             </div>`
                $('#herder-news-conent').append(container)
                i++
            });
            herderNews = data
            console.log(data)
        },
    })
}

function insertHerderNews(id) {
    editHeaderInp.val(herderNews[id].headline)
    editDescription.val(herderNews[id].description)
    editUrlInp.val(herderNews[id].link)
    editUrlInp.prop("disabled", true);
}
