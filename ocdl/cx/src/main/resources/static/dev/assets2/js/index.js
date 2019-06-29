var user_name='';
var project_name='';
var list;
var token= GetQueryString("token");
var id='';
var profileImage='';
var key='';



window.onload = function () {
    initTemplateList();
    initProjectName();
    initUserInfo();
    ShowInitMenu();
};

function initUserInfo() {
    if(token!=''){
        tradeToken4UsrInfo();
    }
}

function addSpan(li,text){
    var span_1=document.createElement("span");
    span_1.innerHTML=text;
    li.appendChild(span_1);
}
function addLi(content, parent){
    var li_1=document.createElement("li");
    li_1.setAttribute("class","d-secondNav s-secondNav");
    li_1.setAttribute("onclick","javascript:getCode('"+content+"','"+parent+"');");
    addSpan(li_1,content);
    document.getElementById(parent).appendChild(li_1);
}


function initProjectName() {
    $.ajax({
        url: enviorment.API.PROJECT,
        contentType: 'application/json',
        dataType: "json",
        type: "GET",
        success: function(data) {
            ajaxMessageReader(data,function (data) {
                var projectName=$("#projectName");
                projectName.text("Project: "+data.projectName);
            })
        },
        error: function (data) {
        }
    })
}

function initTemplateList(){
    $.ajax({
        url: enviorment.API.TEMPLATE_LIST,
        contentType: 'application/json',
        dataType: "json",
        type: "GET",
        success:function (data) {
            ajaxMessageReader(data,function (data) {
                var layerList=data[0];
                var blockList=data[1];
                var networksList=data[2];
                var frameworks = data[3];
                for(var i=0; i<layerList.length;i++){
                    addLi(layerList[i],"Layers");
                }
                for(var i=0; i<blockList.length;i++){
                    addLi(blockList[i],"Blocks");
                }
                for(var i=0; i<networksList.length;i++){
                    addLi(networksList[i],"Networks");
                }
                for(var i=0; i<frameworks.length;i++){
                    addLi(frameworks[i],"Frameworks");
                }
            })
        },

        error: function (data) {
        }
    })
}



function ShowApprovalPortal(content, parent) {
    var li_1=document.createElement("li");
    var a=document.createElement("a");
    a.setAttribute("onclick","forwardTo('views/approvalCenter.html?token="+token+"')");
    a.setAttribute("href","#");
    a.innerHTML=content;
    li_1.appendChild(a);

    document.getElementById(parent).appendChild(li_1);
}
function ShowConfigurationPortal(content, parent){
    var li_1=document.createElement("li");
    var a=document.createElement("a");
    a.setAttribute("onclick","forwardTo('views/configuration.html?token="+token+"')");
    a.setAttribute("href","#");
    a.innerHTML=content;
    li_1.id = "configurationBtn";
    li_1.appendChild(a);
    document.getElementById(parent).appendChild(li_1);
}

function HideConfigurationPortal(id) {
    $("#configurationBtn").remove();
}

function ShowManagerMenu(){
    ShowConfigurationPortal("CONFIGURE","nav-menu");
    $("#model-center-li").show(500);
    $("#IDE-li").show(500);
    $("#file-system-li").show(500);
    $("#code-template-li").show(500);
    $("#welcome-li").hide(500);

    $("#model-center-li").click();
};

function  ShowDeveloperMenu() {
    ShowConfigurationPortal("CONFIGURE","nav-menu");
    $("#IDE-li").show(500);
    $("#file-system-li").show(500);
    $("#code-template-li").show(500);
    $("#welcome-li").hide(500);

    $("#IDE-tab").click();
}

function ShowInitMenu() {
    $("#model-center-li").hide(500);
    $("#IDE-li").hide(500);
    $("#file-system-li").hide(500);
    $("#code-template-li").hide(500);
    $("#welcome-li").show(500);

    setTimeout($("#welcome-tab").click(), 600);

}



function changeProjectName() {
    var name = $("#projectName").text().slice(9);

    $.ajax({
        url: enviorment.API.PROJECT_NAME,
        contentType: 'application/json',
        dataType: "json",
        data:
            JSON.stringify({
                name: name
            }),
        type: "PUT",
        timeout: 0,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        success: function(data){
            ajaxMessageReader(data,function (data) {
            })
        },
        error: function (data) {
        }
    })

}
//validation (pending)
function checkLogin() {
    if($("#username").val()==''){
        alert("please input the username");
        return false;
    }else if($("password").val()==''){
        alert("please input the password");
        return false;
    }
}

function signIn() {

    $.ajax({
        url: enviorment.API.LOGIN_PWD,
        contentType: 'application/json',
        dataType: "json",
        type: "POST",
        data:
            JSON.stringify({
                account: $("#data_username").val(),
                password: $("#data_pwd").val()
            }),
        success:function (data) {
            ajaxMessageReader(data,function (data) {
                token=data['token'];
                tradeToken4UsrInfo();
            })
        },

        error: function (data) {
        }
    })
}

function afterSignIn(data) {
    token = data['token'];
    user_name=data['username'];

    if(data['role']=="MANAGER"){
        ShowManagerMenu();
        initModelTypeList();
    }else{
        ShowDeveloperMenu();
    }

    var status=$("#status");
    var rescource=$("#rescourse");
    var username=$("#username");

    username.text(user_name);
    status.removeClass('status_disconnected');
    status.addClass('status_connected');
    rescource.removeClass('status_NoneR');
    rescource.addClass('status_cpu');

    $("#loginBtnGroup").slideUp();
    $("#userinfo").slideDown();
    $("#closeLogin").click();

    selectJupyterServer();
}



function getCode(name,type) {
    $.ajax({
        url: enviorment.API.TEMPLATE_CODE+"?name="+name+"&type="+type,
        contentType: 'application/json',
        dataType: "json",
        type: "GET",
        success:function (data) {
            ajaxMessageReader(data,function (data) {
                var  code = $("#code");
                $(".dp-highlighter").remove();
                code.text(data[0]);
                dp.SyntaxHighlighter.ClipboardSwf = 'assets2/js/clipboard.swf';
                dp.SyntaxHighlighter.HighlightAll('code');
                jsAnimateMenu();
                $("#code-template-tab").click();
            })
        },

        error: function (data) {
        }
    })
}

function submitToGit(){
    $.ajax({
        url: enviorment.API.MODEL,
        contentType: 'application/json',
        dataType: "json",
        type: "POST",
        timeout: 0,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        success: function(data){
            ajaxMessageReader(data,function (data) {
                alert("Push successful!");
            })
        },
        error: function () {
        }
    })
}

function selectJupyterServer(){
    var rescource=$("#rescourse");
    var server = "cpu";
    if($("#serverCtl").hasClass('toggle--on')){
        server = "cpu";
        rescource.removeClass('status_NoneR');
        rescource.removeClass('status_gpu');
        rescource.addClass('status_cpu');

    }else{
        server = "gpu";
        rescource.removeClass('status_NoneR');
        rescource.removeClass('status_cpu');
        rescource.addClass('status_gpu');
    }
    $.ajax({
        url: enviorment.API.JUPYTER_SERVER+"/"+server,
        contentType: 'application/json',
        dataType: "json",
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
            $("#resourceLoading").show();
            $("#resourceLoadingBar").show();
            $("#Section1_label").text("Launching the resource, please wait..");
        },

        timeout: 0,

        success: function(data) {
            $("#resourceLoading").hide();
            $("#resourceLoadingBar").hide();
            $("#jupyterFrame").show();
            ajaxMessageReader(data,function (data) {
                $('#jupyterFrame').attr('src', "http://"+data["url"]+"/notebooks/MySpace");
                $('#IDE-tab').click();
            })
        },
        error: function () {
            $("#resourceLoading").show();
            $("#resourceLoadingBar").hide();
            $("#jupyterFrame").hide();
            $("#Section1_label").text("Sorry, Fail to load resource!");
        },
        complete:function(){

        }
    })
}


function forwardTo(url){
    window.top.location.href=url;
}

$('#projectName').click(function(){
    var td=$(this); //为后面文本框变成文本铺垫
    var text=$(this).text();
    var input=$('<input type="text" class="edit" value="'+text.slice(9)+'">');
    $(this).html( input );

    $('input').click(function(){
        return false;
    }); //阻止表单默认点击行为

    $('input').select(); //点击自动全选中表单的内容

    $('input').blur(function(){
        var nextxt=$(this).val();
        td.html("Project: "+nextxt);
        changeProjectName();
    }); //表单失去焦点文本框变成文本

});


function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    id = profile.getId();
    console.log('Full Name: ' + profile.getName());
    user_name = profile.getName();
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    profileImage = profile.getImageUrl();
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);

   /* $("#userinfo").show(1000);*/
    $("#userinfo").slideDown();
    $.ajax({
        url: enviorment.API.LOGIN_OAUTH,
        contentType: 'application/json',
        dataType: "json",
        type: "POST",
        timeout: 0,
        data: JSON.stringify({
            id: id
        }),
        success: function(data){

            var username=$("#username");
            var status=$("#status");
            var rescource=$("#rescourse");
            username.text(user_name);
            if (profileImage!=null&&profileImage!=''){
                $("#profileImage").attr("src",profileImage);
                $("#profileImage").removeClass("hide");
            }

            status.removeClass('status_disconnected');
            status.addClass('status_connected');
            rescource.removeClass('status_NoneR');
            rescource.addClass('status_cpu');

            $("#loginBtnGroup").slideUp();
            $("#closeLogin").click();
        },
        error: function () {
        }
    })

}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    $("#userinfo").slideUp();
    $("#loginBtnGroup").slideDown();

    releaseResource();
    HideConfigurationPortal();
    ShowInitMenu();
}

function signUp() {
    var  f_username=$("#signup-username").val();
    var f_password=$("#signup-password").val();
    var f_role= document.getElementById("developer-radio").checked;
    if(f_role){
        f_role="developer";
    }else{
        f_role="manager";
    }


    $.ajax({
        url:enviorment.API.REGISTER,
        type: "POST",
        contentType: 'application/json',
        data:
            JSON.stringify({
                username: f_username,
                password:f_password,
                role:f_role
            }),
        dataType: "json",
        error: function(request) {
            alert("Connection error");
        },
        success: function(data) {
            //接收后台返回的结果
            alert("Sign up successful");
            tradeToken4UsrInfo();
        }

    })
}

function releaseResource(){
    $.ajax({
        url: enviorment.API.LOGOUT,
        contentType: 'application/json',
        dataType: "json",
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        timeout: 0,
        success: function(data){
            alert("User Resources Released");
        },
        error: function () {
            alert("Fail to release resources!");
        }
    })
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return '';
}