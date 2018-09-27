var POSTURL = 'https://thebillwizard.com/wp-json/wp/v2/posts?post_type=post&_embed&status=publish&per_page=5&page=1';
var ARTICLES = [];
var DAYLIMIT = 4;
var NEWARTICLECLASS = "newArticle";
var TRACKINGSTRING = "&utm_source=tbwextension&utm_campaign=chrome";

$(document).ready(function () {


    $("#load-more").click(function(){




    });





    loadPosts();



});



function loadPosts() {

    var postTemplate = '<div class="thumbnail-info col-sm-16 col-md-16 col-lg-6 col-xl-6 col-xxl-6 float-left {{newArticle}}"> <a target="_blank" href="{{the_permalink}}"> <div class="thumbnail"><img src="{{the_thumbnail}}"></div><div class="info"><div class="title">{{the_title}}</div><div class="tile-meta">{{the_author}}&nbsp;&middot;&nbsp;{{the_date}}</div></div></a></div>';

    var destination = $('#tbw-wrapper');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", POSTURL, true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var resp = JSON.parse(xhr.responseText);

         renderLoadedPosts(resp, postTemplate, destination);

        }
    }

    xhr.send();



}

function renderLoadedPosts(obj, template, dest) {





    for (var i = 0; i < obj.length; i++) {
        var temp = template;
        temp = temp.replace(/{{the_permalink}}/gi, getTrackingLink(obj[i].link));
        temp = temp.replace(/{{the_thumbnail}}/gi, obj[i]._embedded['wp:featuredmedia'][0].source_url);
        temp = temp.replace(/{{the_title}}/gi, obj[i].title['rendered']);
        temp = temp.replace(/{{the_author}}/gi, obj[i].metadata.display_aname[0]);
        temp = temp.replace(/{{the_date}}/gi, cleanDate(obj[i].date));
        temp = temp.replace(/{{newArticle}}/gi, isNewArticle(obj[i].date));

        dest.append($(temp));

        ARTICLES.push(obj[i].id);

    }


    $("#spinner").hide();
    $("#load-more").fadeIn(200);


    chrome.runtime.sendMessage({"message": "viewed_articles", "articles": JSON.stringify(ARTICLES)});








}

function cleanDate(iso) {
    var date = new Date(iso);
    var d = date.getDate();
    var m = date.getMonth();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[m] + ' ' + d;
}

function isNewArticle(iso) {

    var curDate = new Date();
    var date = new Date(iso);

    var start = Math.floor(date.getTime() / (3600 * 24 * 1000));
    var end = Math.floor(curDate.getTime() / (3600 * 24 * 1000));
    var daysDiff = end - start; // exact dates


    if(daysDiff <= DAYLIMIT) {
        return NEWARTICLECLASS;
    }

    else {
      return "";

    }



}

function getTrackingLink(link) {

    finallink = link;
    finallink += TRACKINGSTRING;

    return finallink;


}


