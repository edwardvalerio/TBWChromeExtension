
var POSTURL = 'https://thebillwizard.com/wp-json/wp/v2/posts?post_type=post&_embed&status=publish&per_page=5&page=1';
var DAYLIMIT = 2;



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
    if( request.message === "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }

    if(request.message === "returned_badge") {


        getDisplayBadge();

       }



  }


);


function getDisplayBadge() {


    var PENDING = 0;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", POSTURL, true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var resp = JSON.parse(xhr.responseText);


     for (var i = 0; i < resp.length; i++) {

         var isNew = isNewArtic(resp[i].date);


         hasBeenViewedBefore(resp[i].id).then(function(result){

             if(isNew && !result) {
                 PENDING++;

                 chrome.browserAction.setBadgeBackgroundColor({ color: [255, 104, 88, 255] });
                chrome.browserAction.setBadgeText({text: "" + PENDING });

            }



         });






      }




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

function hasBeenViewedBefore(id) {


    return new Promise(function(resolve, reject) {

         chrome.storage.local.get("viewedArticles", function(items) {

             var articles = JSON.parse(items.viewedArticles);

             if(!articles) { reject(false) }

             for (var i = 0; i < articles.length; i++) {
                 if(id == articles[i]) {

                    return true;
                     console.log("true")

                     resolve(true);
                 }
             }

              resolve(false);


         });


    });


}



