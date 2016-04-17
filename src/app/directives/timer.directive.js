(function() {
    "use strict";

    angular.module("app.user")
        .directive("timer", timer);

    timer.$inject = ["$timeout", "$state", "TIME_DELAY", "testPlayerService"];

    function timer($timeout, $state, TIME_DELAY, testPlayerService) {
        var directive = {
            scope: {
                duration: "=",
                finishTest: "&"
            },
            link: function(scope, element) {
                scope.$watch("duration", function() {
                    if (scope.duration === undefined) {
                        element.html("");
                    } else {
                        getTimeStamp().then(function (response) {
                            var timeStamp = response;
                            var endTimeTest, timeDiff, time, hours, mins, secs;
                            var endTime = new Date().valueOf() + 1000 * 60 * scope.duration;
                            saveEndTime(timeStamp).then(function (response) {
                                getEndTime().then(function (response) {
                                    endTimeTest = response.endTimeTest;
                                    updateTimer();
                                });
                            });

                            function updateTimer() {
                                if (endTimeTest === undefined) {
                                    timeDiff = endTime - new Date().valueOf();
                                    setTimer();
                                } else {
                                    getTimeStamp().then(function (response) {
                                        timeDiff = (endTimeTest - response.curtime) * 1000;
                                        setTimer();
                                    });
                                }
                            }

                            function setTimer() {
                                if (timeDiff <= 0) {
                                    element.html("Час вичерпано");
                                    $timeout(endTest, TIME_DELAY * 1000);
                                } else {
                                    time = new Date(timeDiff);
                                    hours = time.getUTCHours();
                                    mins = time.getUTCMinutes();
                                    secs = time.getUTCSeconds();
                                    element.html((hours ? (twoDigits(hours) + ":") : "") + twoDigits(mins) + ":" + twoDigits(secs));
                                    $timeout(updateTimer, 500);
                                }
                            }
                        });
                    }
                });
                
                function endTest() {
                    scope.finishTest();
                    $state.go("user.results");
                }

                function getTimeStamp() {
                    return testPlayerService.getTimeStamp().then(function(response) {
                       return response; 
                    });
                }

                function getEndTime() {
                    return testPlayerService.getEndTime().then(function(response) {
                        return response;
                    });
                }

                function saveEndTime(timeStamp) {
                    var timeForTest = {};
                    timeForTest.startTimeTest = timeStamp.curtime;
                    timeForTest.duration = 60 * scope.duration;
                    timeForTest.endTimeTest = timeStamp.curtime + 60 * scope.duration;

                    return testPlayerService.saveEndTime(angular.toJson(timeForTest)).then(function (response) {
                        return response;
                    });
                }
                
                function twoDigits(n) {
                    return (n <= 9 ? "0" + n : n);
                }
            }
        };

        return directive;
    }
})();