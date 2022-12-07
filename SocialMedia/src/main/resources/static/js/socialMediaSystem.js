var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const userId = localStorage.getItem("userId");
    $scope.loginUserId = localStorage.getItem("userId");
    $scope.userData = localStorage.getItem("userProfileData");
    $scope.userData = JSON.parse($scope.userData);
    $scope.userData.contactNum = Number($scope.userData.contactNum);
    $scope.tempUserData = Object.assign({}, $scope.userData);
    $scope.isProfileDisplay = false;
    $scope.isCommunitiesDisplay = false;
    var URL = "https://fir-1c7de-default-rtdb.firebaseio.com";
    $scope.orderDetails = {};
    $scope.seatList = [];

    $scope.viewThoughtData = [];

    $scope.onload = function () {
        $scope.getThoughts();
        $(".routeCls").show();
        $(".paymentCls").hide();
        $(".referCls").hide();
    }
    $scope.placeOrder = function (data) {
        $scope.orderDetails = data;
        $scope.getOrderTableData("BOOKING");
    }
    $scope.addThoughts = function () {
        if (checkIsNull(userId)) {
            alert("Please login again");
        } else {

            if (checkIsNull($("#shareBoxId").val()) && checkIsNull($scope.imgUrlData)) {
                alert("Please fill the box");
            } else {
                let reqstBody = {
                    "shareBoxId": $("#shareBoxId").val(),
                    "imgUrlData": $scope.imgUrlData
                };
                $.ajax({
                    type: 'post',
                    contentType: "application/json",
                    dataType: 'json',
                    cache: false,
                    url: URL + "/socialMedia/" + userId + ".json",
                    data: JSON.stringify(reqstBody),
                    success: function (response) {
                        alert("Updated!!!");
                        $("#shareBoxId").val("");
                        $('#inputFileId').next('.custom-file-label').html("Add your memory");

                        $scope.getThoughts();
                    }, error: function (error) {
                        alert("Something went wrong");
                    }
                });
            }
        }
    }
    $scope.getThoughts = function () {
        $scope.viewThoughtData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/socialMedia.json",
            success: function (response) {
                for (let data in response) {
                    for (let x in response[data]) {
                        let eventData = response[data][x];
                        eventData["userId"] = data;
                        eventData["childUserId"] = x;
                        $scope.viewThoughtData.unshift(eventData);
                    }
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.updateProfileData = function () {
        let requestBody = Object.assign({}, $scope.userData);
        delete requestBody.gender;
        delete requestBody.loginUserName;
        delete requestBody.password;
        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/socialMediaRegister/" + userId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                alert(" Profile data has been updated!!!");
                localStorage.setItem("userProfileData", JSON.stringify($scope.userData));

            }, error: function (error) {
                $scope.userData = Object.assign({}, $scope.tempUserData);
                alert("Something went wrong");
            }
        });
    }


    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        window.location.href = "login.html";
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        if (type != "PROFILE") {
            $('#' + id).addClass("active");
        }
        if (type == "HOMEFEED") {
            $scope.isProfileDisplay = false;
            $scope.isCommunitiesDisplay = false;
        } else if (type == "COMMUNITIES") {
            $scope.isProfileDisplay = false;
            $scope.isCommunitiesDisplay = true;
            $scope.getUserList();
        }
    }

    $scope.getUserList = function () {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/socialMediaRegister.json",
            success: function (lresponse) {
                var userListData = [];
                for (let i in lresponse) {
                    let data = lresponse[i];
                    data["userId"] = i;
                    userListData.push(data);
                }
                $scope.getFriendList(userListData);
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getFriendList = function (userListData) {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addFriendSocialMedia/" + userId + ".json",
            success: function (lresponse) {
                let frndUsersId = [];
                $scope.tempFriendList = [];
                $scope.friendList = [];
                for (let i in lresponse) {
                    let data = lresponse[i];
                    let tempId = lresponse[i].userId;
                    frndUsersId.push(tempId);
                    data["userId"] = i;
                    $scope.friendList.push(data);


                }
                userListData.forEach(obj => {
                    if (!frndUsersId.includes(obj.userId)) {
                        obj['status'] = "NotFriend";
                    } else {
                        obj['status'] = "Friend";
                    }
                });
                $scope.friendList = userListData;
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.addFriend = function (data) {
        data["status"] = "Friends";
        if (data.hasOwnProperty("$$hashKey")) {
            delete data.$$hashKey;
        }
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addFriendSocialMedia/" + userId + ".json",
            data: JSON.stringify(data),
            success: function (response) {
                $scope.switchMenu('COMMUNITIES', 'communitiesTabId');
                alert("Operation has been completed sucessfully!!!");
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getAddedFriendList = function (friendData) {
        let frndList = [];
        let obj = {};
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addFriendSocialMedia/" + userId + ".json",
            success: function (lresponse) {
                for (let i in lresponse) {
                    let data = lresponse[i];
                    data["friendId"] = i;
                    frndList.push(data);
                    obj[lresponse[i].userId] = i;

                }
                $scope.removeFriend(friendData, obj)
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.removeFriend = function (data, obj) {

        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addFriendSocialMedia/" + userId + "/" + obj[data.userId] + ".json",
            data: JSON.stringify(data),
            success: function (response) {
                $scope.getUserList();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }

    function checkIsNull(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }

    $(document).ready(function () {

        $('#inputFileId').on('change', function () {
            debugger;
            var fileReader = new FileReader();
            fileReader.onload = function () {
                $scope.imgUrlData = fileReader.result;  // data <-- in this var you have the file data in Base64 format
            };
            fileReader.readAsDataURL($('#inputFileId').prop('files')[0]);
            var file = $('#inputFileId')[0].files[0].name;
            $(this).next('.custom-file-label').html(file);
        });
        $('#profilePic').on('change', function () {
            debugger;
            var fileReader = new FileReader();
            fileReader.onload = function () {
                $scope.userData.profilePic = fileReader.result;  // data <-- in this var you have the file data in Base64 format
            };
            fileReader.readAsDataURL($('#profilePic').prop('files')[0]);
            var file = $('#profilePic')[0].files[0].name;
            $(this).next('.custom-file-label').html(file);
        });
    });
});
