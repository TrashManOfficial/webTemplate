function getAuth() {
  var siteid = document.head.getElementsByTagName('meta')['siteid'].getAttribute('content')
  var channelid = document.head.getElementsByTagName('meta')['channelid'].getAttribute('content')
  trsAxios
    .get("/wcm/mlfcenter.do", {
      params: {
        methodname: "checkWebSiteRight",
        serviceid: "mlf_mediasite",
        siteId: siteid,
        channelId: channelid
      },
    })
    .then((res) => {
      if (res.HASRIGHT === 'false') {
            $('body').html('<div style="width: 100%;text-align: center; font-size: large;margin-top: 20px">暂无查看权限</div>')
            return
      }
      $(".dw_select span").text(res.SITENAME)
      // $('body').css('visibility','visible')
      $('#app').css('visibility','visible')
      getSiteData()
      // console.log(res);
    });
}
function setDropDownList(list) {
  $.each(list, function (index, item) {
    $(".dw_select ul").append(
      $("<li>", { value: item.ROOTDOMAIN, text: item.NAME }).on(
        "click",
        function () {
          location.href = $(this).attr("value")
        }
      )
    );
  });
}
function getSiteData() {
  trsAxios
    .get(
      "/wcm/mlfcenter.do?methodname=queryPortal&serviceid=mlf_mediasite"
    )
    .then((res) => {
      setDropDownList(res);
    });
}
window.onload = function () {
  getAuth();
};