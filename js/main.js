let remoteHost = 'https://cv-constructor-django.herokuapp.com';
let localHost = location.origin;
let loadScripts = null;
let loadBlocks = null;
let loadStyles = null;
let waitToLoad = 0;
let loaded = 0;

$(document).ready(function (){
	$('#cv-app').fadeOut('fast');
	lazyLoadBlocks();
	for (let i in loadStyles)
		sendAjax(`${localHost}${loadStyles[i]}`, 'head', loadStyle);
	for (let i in loadScripts)
		sendAjax(`${localHost}${loadScripts[i]}`, 'head', loadScript);
	loadBlocks.each(function (i, block) {
		let blockId = $(block).attr('id');
		sendAjax(`${remoteHost}/getBlock/${blockId}`, blockId, loadBlock);
	});
	bsBreakpoints.init();
})
$(window).on('resize', function () {
	bsBreakpoints.init();
	adaptBlock();
})
function lazyLoadBlocks(){
	loadBlocks = $('.loadBlock');
	waitToLoad += loadBlocks.length;
}
function lazyLoadStyles(stylesPathArr){
	loadStyles = stylesPathArr;
	waitToLoad += stylesPathArr.length;
}
function lazyLoadScripts(scriptsPathArr){
	loadScripts = scriptsPathArr;
	waitToLoad += scriptsPathArr.length;
}
function adaptBlock(){
	let InfoBlock = $('.Info');
	if(bsBreakpoints.getCurrentBreakpoint() == 'small' || bsBreakpoints.getCurrentBreakpoint() == 'xSmall')
		InfoBlock.removeClass('position-fixed w-50').parent().addClass('col-12');
	else
		InfoBlock.addClass('position-fixed w-50').parent().removeClass('col-12');
	if (InfoBlock.height()){
		if ($(window).height() < InfoBlock.height())
			InfoBlock.removeClass('position-fixed w-50').parent().addClass('col-12');
	}
}
function loadScript(content, block){
	$(block).append(`<script>${content}</script>`);
	saveLoading();
}
function loadStyle(content, block){
	$(block).append(`<style>${content}</style>`);
	saveLoading();
}
function loadBlock(content, blockId){
	$(`#${blockId}`).html(content);
	saveLoading();
}
function saveLoading(){
	loaded += 1;
	checkLoading();
}
function checkLoading(){
	if (waitToLoad === loaded) {
		$('#loadScreen').fadeOut('slow', function () {
			$('#cv-app').fadeIn('slow', function (){
				adaptBlock();
				Revealator.refresh();
			});
		});
	}
}
function sendAjax(url, blockId, callback=false){
	$.ajax({
		url: url,
		method: 'GET',
		complete: function (response) {
			if (callback)
				callback(response.responseText, blockId);
		}
	});
}