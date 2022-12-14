var URL = "https://fir-1c7de-default-rtdb.firebaseio.com";
var imgUrl = "";
function checkIsNull(value) {
    return value === "" || value === undefined || value === null ? true : false;
}
function loginUser() {
    let requestBody = {
        "loginUserName": $("#registerUserNameId").val(),
        "password": $("#pwdId").val()
    }
    if (checkIsNull($("#registerUserNameId").val()) || checkIsNull($("#pwdId").val())) {
        alert("Please fill Required Data");
    } else {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/socialMediaRegister.json",
            data: JSON.stringify(requestBody),
            success: function (lresponse) {
                let loginUserList = [];
                for (let i in lresponse) {
                    let data = lresponse[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                //if (typeof (Storage) !== "undefined") {
                // Store
                let isValid = false;
                for (let i = 0; i < loginUserList.length; i++) {
                    if (loginUserList[i].loginUserName == $("#registerUserNameId").val() && loginUserList[i].password == $("#pwdId").val()) {
                        isValid = true;
                        // if (!checkIsNull(loginUserList[i].profilePic)) {
                        //     loginUserList[i].profilePic = loginUserList[i].profilePic;
                        // }
                        localStorage.setItem("userId", loginUserList[i].userId);
                        localStorage.setItem("admin", loginUserList[i].userType);
                        localStorage.setItem("userProfileData", JSON.stringify(loginUserList[i]));
                        window.location.href = "socialMedia.html";

                    }
                }
                if (!isValid) {
                    alert("User not found");
                }

                //}
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
}
function registerUser() {

    if (checkIsNull($("#userNameId").val()) || checkIsNull($("#dobId").val()) || checkIsNull($("#loginUserNameId").val())
        || checkIsNull($("#passwordId").val()) || checkIsNull($("#contactId").val()) || checkIsNull($("input[name='genderRadio']:checked").val())) {
        alert("Please fill all the required data");
    } else {
        let requestBody = {
            "userName": $("#userNameId").val(),
            "dob": $("#dobId").val(),
            "loginUserName": $("#loginUserNameId").val(),
            "emailId": $("#userEmailId").val(),
            "password": $("#passwordId").val(),
            "contactNum": $("#contactId").val(),
            "gender": $("input[name='genderRadio']:checked").val(),
            "profilePic": imgUrl
        }
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            cache: false,
            url: URL + "/socialMediaRegister.json",
            data: JSON.stringify(requestBody),
            success: function (lresponse) {
                $('#regModelId').modal('hide');
                alert("Registerd sucessfully!!!");
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
}
function resetData() {
    $("#userNameId").val("");
    $("#dobId").val("");
    $("#userEmailId").val("");
    $("#passwordId").val("");
    $("#contactId").val("");
    $("input[type=radio][name=genderRadio]").prop("checked", false);
    $("#loginUserNameId").val("")
    $('#profilePic').next('.custom-file-label').html("Upload your profile photo");


}
$(document).ready(function () {
    $('#regModelId').on('hidden.bs.modal', function (e) {
        resetData();
    })
    $('#profilePic').on('change', function () {
        debugger;
        var fileReader = new FileReader();
        fileReader.onload = function () {
            imgUrl = fileReader.result;  // data <-- in this var you have the file data in Base64 format
        };
        fileReader.readAsDataURL($('#profilePic').prop('files')[0]);
        var file = $('#profilePic')[0].files[0].name;
        $(this).next('.custom-file-label').html(file);
    });
});
