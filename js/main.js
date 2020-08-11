function loadFReviews() {
    $.ajax({
        type: "GET",
        url: "https://www.freelancer.com/api/projects/0.1/reviews/?role=freelancer&to_users[]=46624288&compact=true",
        complete: function (data) {
            let reviews = JSON.parse(data.responseText)['result']['reviews'];
            let leBlock = document.getElementById("latestExperience");
            let d = 1;
            for (let r in reviews) {
                let projectName = reviews[r]['review_context']['context_name'];
                let projectURL = "https://freelancer.com/" + reviews[r]['review_context']['seo_url'];
                let rating = reviews[r]['rating'];
                let paid = reviews[r]['paid_amount'];
                let currency = reviews[r]['currency']['sign'];
                let description = reviews[r]['description'];
                let revBlock = document.createElement("div");
                revBlock.setAttribute("class", "revealator-slideright revealator-partially-above revealator-once revealator-delay" + d++);
                let revTitle = document.createElement("div");
                revTitle.setAttribute("class", "card-header bg-light text-dark shadow-sm rounded-0 font-weight-bold");
                revTitle.innerHTML = "<a href='" + projectURL + "' target='_blank'>" + projectName + "</a>" + " " + rating
                    + " <i class='fas fa-star text-warning'></i>"
                    + " <span class='text-success'>" + paid + currency + "</span>";
                let revBody = document.createElement("div");
                revBody.setAttribute("class", "border-bottom card-body bg-light small text-secondary font-weight-bold");
                revBody.innerHTML = description;
                revBlock.append(revTitle, revBody);
                leBlock.append(revBlock);
            }
            let l = leBlock.getAttribute("class").split("d-none")[1];
            leBlock.setAttribute("class", l);
        }
    })
}
function pdfDump() {
    let cssStyles = document.getElementsByTagName("link");
    let cssDump = null;
    let pdfBtn = document.getElementsByClassName("pdfBtn")[0];
    pdfBtn.onclick = function(){return};
    let textDump = null;
    for (let i = 0; i < cssStyles.length; i++){
        if(cssStyles[i].href && cssStyles[i].href.includes("fm.revealator.jquery.css")) {
            cssDump = cssStyles[i].cloneNode();
            cssStyles[i].remove();
        }
    }
    let sizeDump = document.documentElement.style.width;
    document.documentElement.style.width = "1350px";
    document.getElementsByClassName("pdfBtn")[0].style.visibility = "hidden";
    let htmlDump = new XMLSerializer().serializeToString(document);
    if(cssDump)
        document.getElementsByTagName("head")[0].append(cssDump); //Restore Dumped CSS
    document.documentElement.style.width = sizeDump;
    let data = {
        "html": htmlDump,
        "method": "1",
        "pageOrientation": "Portrait",
        "pageWidth": window.innerWidth,
        "singlePage": "False",
        "targetUrl": window.location.href,
        "dateTime": Date.now()
    };
    $.ajax({
        url: "https://pdfmage.org/api/process",
        method: "POST",
        data: data,
        dataType: "json",
        beforeSend: function(){
            document.getElementsByClassName("pdfBtn")[0].style.visibility = "visible";
            textDump = pdfBtn.innerHTML;
            pdfBtn.innerHTML = "<span class=\"text-danger spinner-grow spinner-grow-sm\" role=\"status\" aria-hidden=\"true\"></span>";
        },
        success: function (d) {
            pdfBtn.innerHTML = "<a href='" + d['Data']['DownloadUrl']  + "' target='_blank'>" +
                "<i class=\"fas text-white fa-arrow-alt-circle-down\"></i></a>";
        },
        complete: function () {
            pdfBtn.onclick = function () {
                pdfBtn.innerHTML = textDump;
                pdfBtn.onclick = function (){pdfDump()};
            }
        }
    })
}