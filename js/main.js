let remoteHost = 'https://cv-constructor-django.herokuapp.com';
let localHost = location.origin;
let toLoadScripts = null;
let toLoadBlocks = null;
let toLoadStyles = null;
let differentBlocks = [];
let waitToLoad = 0;
let loaded = 0;


$(document).ready(function () {
    bsBreakpoints.init();
    loadHashes();
    lazyLoadBlocks();
    loadStyles();
    loadScripts();
})
$(window).on('resize', function () {
    bsBreakpoints.init();
    adaptBlock();
})

function changeLoadingBar(text) {
    $('#loadingBar').text(text);
}

function loadHashes() {
    waitToLoad += 1;
    sendAjax(`${remoteHost}/getBlocksHashes`, false, saveHashes);
}

function saveHashes(hashes) {
    hashes = JSON.parse(hashes);
    for (let h in hashes) {
        if (localStorage.getItem(h) !== hashes[h]) {
            localStorage.setItem(h, hashes[h]);
            differentBlocks.push(h);
        }
    }
    $('#loadingBarHeroku').fadeOut('slow');
    changeLoadingBar('Loading Hashes');
    loadBlocks();
    saveLoading();
}

function loadBlocks() {
    toLoadBlocks.each(function (i, block) {
        let blockId = $(block).attr('id');
        let content = localStorage.getItem(`${blockId}_Content`);
        if (differentBlocks.includes(blockId) || content === 'null' || !content)
            sendAjax(`${remoteHost}/getBlock/${blockId}`, blockId, loadBlock);
        else
            loadBlock(content, blockId, true);
    });
}

function loadScripts() {
    changeLoadingBar(`Loading Static Scripts`);
    for (let i in toLoadScripts)
        sendAjax(`${localHost}${toLoadScripts[i]}`, 'head', loadScript);
}

function loadStyles() {
    changeLoadingBar(`Loading Static Styles`);
    for (let i in toLoadStyles)
        sendAjax(`${localHost}${toLoadStyles[i]}`, 'head', loadStyle);
    herokuLoadBarShow(); // If Load is Freeze
}

function herokuLoadBarShow() {
    setTimeout(() => {
        $('#loadingBarHeroku').fadeIn('fast');
        $('#frogAnim').fadeIn('fast');
    }, 3000)
}

function lazyLoadBlocks() {
    toLoadBlocks = $('.loadBlock');
    waitToLoad += toLoadBlocks.length;
}

function lazyLoadStyles(stylesPathArr) {
    toLoadStyles = stylesPathArr;
    waitToLoad += stylesPathArr.length;
}

function lazyLoadScripts(scriptsPathArr) {
    toLoadScripts = scriptsPathArr;
    waitToLoad += scriptsPathArr.length;
}

function adaptBlock() {
    let InfoBlock = $('.Info');
    if (bsBreakpoints.getCurrentBreakpoint() == 'small' || bsBreakpoints.getCurrentBreakpoint() == 'xSmall')
        InfoBlock.removeClass('position-fixed w-50').parent().addClass('col-12');
    else
        InfoBlock.addClass('position-fixed w-50').parent().removeClass('col-12');
    if (InfoBlock.height()) {
        if ($(window).height() < InfoBlock.height())
            InfoBlock.removeClass('position-fixed w-50').parent().addClass('col-12');
    }
}

function loadScript(content, block) {
    $(block).append(`<script>${content}</script>`);
    saveLoading();
}

function loadStyle(content, block) {
    $(block).append(`<style>${content}</style>`);
    saveLoading();
}

function loadBlock(content, blockId, cache = false) {
    if (!cache) {
        changeLoadingBar(`Loading ${blockId}`);
        localStorage.setItem(`${blockId}_Content`, content);
    }
    $(`#${blockId}`).html(content);
    saveLoading();
}

function saveLoading() {
    loaded += 1;
    checkLoading();
}

function checkLoading() {
    if (waitToLoad === loaded) {
        $('#loadScreen').fadeOut(800);
        $('#cv-app').fadeIn(1000);
        bsBreakpoints.init();
        adaptBlock();
        Revealator.refresh();
    }
}

function sendAjax(url, blockId, callback = false) {
    $.ajax({
        url: url,
        method: 'GET',
        complete: function (response) {
            if (callback)
                callback(response.responseText, blockId);
        }
    });
}