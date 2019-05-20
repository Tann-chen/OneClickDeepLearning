


var salesData = [
    {label: "Waiting", value: 3, color: "#3366CC"},
    {label: "Reject", value: 5, color: "#DC3912"},
    {label: "Approval", value: 1, color: "#109618"}
];

var modelTypeList;


var svg = d3.select("#pie").append("svg").attr("width", 700).attr("height", 300);

svg.append("g").attr("id", "salesDonut");
Donut3D.draw("salesDonut", randomData(), 150, 150, 130, 100, 30, 0.4);

Donut3D.draw("salesDonut", salesData, 150, 150, 130, 100, 30, 0.4);


token = GetQueryString("token");

initProjectName();
initUserInfo();

initModelTypeList();


function initApproralCenterInfo() {
    $("#tableNew .data").remove();
    $("#tableApproval .data").remove();
    $("#tableRejected .data").remove();


    $.ajax({
        url: enviorment.API.MODEL,
        contentType: 'application/json',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        type: "GET",
        success: function (data) {
            ajaxMessageReader(data, function (data) {
                salesData[0].value = data['newModels'].length;
                salesData[1].value = data['approvalModels'].length;
                salesData[2].value = data['rejectedModels'].length;
                $("#newModelNum").text(salesData[0].value);
                $("#approvalModelNum").text(salesData[1].value);
                $("#rejectedModelNum").text(salesData[2].value);
                $("#todoNum").text(salesData[0].value);
                Donut3D.draw("salesDonut", salesData, 150, 150, 130, 100, 30, 0.4);

                <!-- waiting list -->
                for (var i = 0; i < data["newModels"].length; i++) {
                    var tr = "<tr class='data'><td>" + data["newModels"][i].modelName + "</td><td>" +
                        "<select id=\"modelType" + data["newModels"][i].modelId+"\" >" +
                        "</select>" +
                        "</td> <td>" +
                        "<select id=\"version" + data["newModels"][i].modelId + "\" style=\"color: black;\">\n" +
                        "<option value=\"CACHED_VERSION\">\n" +
                        "CACHED VERSION\n" +
                        "</option>\n" +
                        "<option value=\"RELEASE_VERSION\">\n" +
                        "RELEASE VERSION\n" +
                        "</option>\n" +
                        "</select>" +
                        "</td>  " +
                        "<td><td>"+ data["newModels"][i].timestamp +"</td>" +
                        " <div class=\"btn-group\" role=\"group\" aria-label=\"Basic example\">" +
                        "<button type=\"button\" class=\"btn btn-success\" onclick='UpdateDecision(\"" + data["newModels"][i].modelId + "\",1,\"new\")'>Approve</button>" +
                        "<button type=\"button\" class=\"btn btn-danger\" onclick='UpdateDecision(\"" + data["newModels"][i].modelId+"\",0,\"new\")'>Reject</button>" +
                        "</div>" +
                        "</td></tr>";

                    $("#tableNew").append(tr);

                    for (var j = 0; j < modelTypeList.length; j++) {
                        var option = document.createElement("OPTION");
                        option.text = modelTypeList[j];
                        option.value = modelTypeList[j];
                        document.getElementById("modelType" + data["newModels"][i].modelId).options.add(option);
                    }

                }

                <!-- approval list -->
                for (var i = 0; i < data["approvalModels"].length; i++) {
                    var tr = "<tr class='data'><td>" + data["approvalModels"][i].modelName + "</td> <td>" + data["approvalModels"][i].algorithm + "</td> <td>" + data["approvalModels"][i].version + "</td>  " +
                        "<td> <td>"+ data["approvalModels"][i].timeStamp +"</td>" +
                        " <div class=\"btn-group\" role=\"group\" aria-label=\"Basic example\">" +
                        "<button type=\"button\" class=\"btn btn-danger\" onclick='UpdateDecision(\"" + data["approvalModels"][i].modelId + "\",-1,\"approved\")'>Undo</button>" +
                        "</div>" +
                        "</td></tr>";
                    $("#tableApproval").append(tr);
                }

                <!-- reject list -->
                for (var i = 0; i < data["rejectedModels"].length; i++) {
                    var tr = "<tr class='data'><td>" + data["rejectedModels"][i].modelName + "</td><td>" + data["rejectedModels"][i].timestamp + "</td>" +
                        "<td>\n" +
                        " <div class=\"btn-group\" role=\"group\" aria-label=\"Basic example\">" +
                        "<button type=\"button\" class=\"btn btn-danger\" onclick='UpdateDecision(\"" + data["rejectedModels"][i].modelId + "\",-1,\"rejected\")'>Undo</button>" +
                        "</div>" +
                        "</td></tr>";
                    $("#tableRejected").append(tr);
                }


            })
        },
        error: function (data) {
        }
    })
}

function initModelTypeList() {
    $.ajax({
        url: enviorment.API.MODEL_TYPE,
        contentType: 'application/json',
        dataType: "json",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        success: function (data) {
            ajaxMessageReader(data, function (data) {
                modelTypeList = data;
                initApproralCenterInfo();
            })
        },
        error: function (data) {
        }
    })
}


function UpdateDecision(id,status,origin) {
    var decision='';
    var modelType=-1;
    var bigVersion='NONE';
    if(status==0){
        decision="rejected";
    }else if(status==1){
        decision="approved";
        var indexModel=document.getElementById("modelType"+id).selectedIndex;
        modelType=document.getElementById("modelType"+id).options[indexModel].value;
        var indexVersion=document.getElementById("version"+id).selectedIndex;
        bigVersion = document.getElementById("version"+id).options[indexVersion].value;
    }else if(status==-1){
        decision="new";
    }

    $.ajax({
        url: enviorment.API.MODEL+"/"+id+"?fromStatus="+origin+"&toStatus="+decision+"&upgradeVersion="+bigVersion,
        contentType: 'application/json',
        dataType: "json",
        data:
            JSON.stringify({
                modelId: id,
                status: origin,
                algorithm: modelType
            }),
        type: "POST",
        timeout: 0,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("AUTH_TOKEN", token);
        },
        success: function (data) {
            ajaxMessageReader(data, function (data) {
                initApproralCenterInfo();
            })
        },
        error: function (data) {
        }
    })
}

function randomData() {
    return salesData.map(function (d) {
        return {label: d.label, value: 1000 * Math.random(), color: d.color};
    });
}

function ajaxMessageReader(response, func) {
    if (response.code == "400") {
        alert(response.get("message"));
    } else if (response.code == "200") {
        func(response.data);
    }

    /* func(response);*/
}