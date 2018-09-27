
var POSTURL = 'https://thebillwizard.com/wp-json/wp/v2/posts?post_type=post&_embed&status=publish&per_page=5&page=1';
var DAYLIMIT = 4;
var PENDING = 0;



// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });


});

// This block is new!
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {


    switch(request.message) {

        case "open_new_tab":
               chrome.tabs.create({"url": request.url});

             break;

        case "returned_badge":
               getDisplayBadge();
             break;

        case "viewed_articles":

             saveViewedArticles(request.articles);
             break;




           }

  }

);


function saveViewedArticles(articles) {


      chrome.storage.local.set({"viewedArticles": articles}, function() {



        });




}

function getDisplayBadge() {


    PENDING = 0;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", POSTURL, true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var resp = JSON.parse(xhr.responseText);


     for (var i = 0; i < resp.length; i++) {

         var isNew = isNewArtic(resp[i].date);

         hasBeenViewedBefore(resp[i].id, isNew).then(function(result){



             if(result.isnew){


                 if(result.success != true) {

                 PENDING++;
                 chrome.browserAction.setBadgeText({text: "" + PENDING });

               }


             }





         });


      }

        if(PENDING == 0) {

             chrome.browserAction.setBadgeText({text: "" });

        }



         chrome.browserAction.setBadgeBackgroundColor({ color: [255, 104, 88, 255] });


       }
    }

xhr.send();



}


function isNewArtic(iso) {

    var curDate = new Date();
    var date = new Date(iso);

    var start = Math.floor(date.getTime() / (3600 * 24 * 1000));
    var end = Math.floor(curDate.getTime() / (3600 * 24 * 1000));
    var daysDiff = end - start; // exact dates



    if(daysDiff <= DAYLIMIT) {
        return true;
    }

    else {
      return false;

    }

}

function hasBeenViewedBefore(id, isnew) {


    return new Promise(function(resolve, reject) {

         chrome.storage.local.get(['viewedArticles'], function(items) {


             if(items.viewedArticles) {

             var articles = JSON.parse(items.viewedArticles);

             for(var i = 0; i < articles.length; i++) {

                 if(id == articles[i]) {


                     resolve({'success': true, 'isnew': isnew});

                 }

             }

              resolve({'success': false, 'isnew': isnew});


                }

             else {

                resolve({'success': false, 'isnew': isnew});
             }





         });


    });


}



