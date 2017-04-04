function postData(eventType, dataJSON) {

    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent
            .indexOf('OPR')) != -1) {
        applicationType = "opera";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        applicationType = "chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        applicationType = "safari";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        applicationType = "firefox";
    } else if ((navigator.userAgent.indexOf("MSIE") != -1)
        || (!!document.documentMode == true)) {
        applicationType = "IE";
    } else {
        applicationType = "unknown";
    }

    var pos = navigator.geolocation.getCurrentPosition(onPositionReceived);
    function onPositionReceived(position) {
        pos = position.coords.latitude + "," + position.coords.longitude;
    }

    var currentdate = new Date();
    var date = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear();
    var time = currentdate.getHours() + ":" + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();


    var data = new Object();
    window.JSONObj = new Object();
    JSONObj.eventType = eventType;
    JSONObj.location = pos;
    JSONObj.date = date;
    JSONObj.time = time;
    JSONObj.applicationType = applicationType;
    JSONObj.IPAddress = "changeThis";
    JSONObj.userID = dataJSON.email; //
    JSONObj.deviceID = "1"; // mac address?
    JSONObj.data = dataJSON;

    console.log(JSONObj);

    var ourRequest = new XMLHttpRequest();
    ourRequest.open('POST', '/transactions');

    ourRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("success");
            window.location.href = "paymentOption.html";
        }

    };
    ourRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ourRequest.send(JSON.stringify(JSONObj));

}
