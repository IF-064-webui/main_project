(function() {
    "use strict";

    angular.module("app.user")
        .factory("userService", userService);

    userService.$inject = ["$http", "$q", "authService", "studentsService", "schedulesService", "entityService", 
        "reportsService", "BASE_URL", "URL"];

    function userService($http, $q, authService, studentsService, schedulesService, entityService, reportsService, 
                         BASE_URL, URL) {

        var service = {
            getCurrentUser: getCurrentUser,
            getSchedules: getSchedules,
            getHeaderSubjects: getHeaderSubjects,
            getResults: getResults,
            getHeaderResults: getHeaderResults
        };

        return service;

        function _successCallback(response) {
            return response.data;
        }

        function _errorCallback(response) {
            return response;
        }
        
        function getCurrentUser () {
            var deferred = $q.defer();
            authService.isLogged()
                .then(function (data) {
                    return data.id;
                })
                .then(function (id) {
                    studentsService.getStudentById(id).then(function (response) {
                        deferred.resolve(response);
                    })
                });

            return deferred.promise
        }

        function getSchedules (group_id) {
            var deferred = $q.defer();

            schedulesService.getSchedulesForGroup(group_id).then(function (response) {
                    return response;
                })
                .then(function (schedule) {
                    var subjectIds = _getSubjectIds(schedule);
                    entityService.getEntitiesById("Subject", subjectIds).then(function (response) {
                        response.forEach(function (elem, index) {
                            elem.event_date = schedule[index].event_date;
                            elem.enabled = _checkDate(schedule[index].event_date);
                        });

                        deferred.resolve(response);
                    })
                });

            return deferred.promise
        }

        function getHeaderSubjects() {
            return ["Предмет", "Дата екзамену"];
        }

        function _getSubjectIds (array) {
            var subjectIds =[];
            array.forEach(function (item) {
                subjectIds.push(item.subject_id);
            });

            return subjectIds;
        }

        function _checkDate(date) {
            var testDate = Date.parse(date);
            var nowDate = new Date();

            return nowDate >= testDate && nowDate <= (testDate + 24*60*60*1000)
        }


        function getResults() {
            return _getStudentIdIsLogged().then(function (student_id) {
                return _getResultsByStudent(student_id).then(function (data) {
                    var results = data;
                    if (!results.hasOwnProperty("response")) {
                        results = reportsService.addToResultsCountTrueAnswers(results);
                        var testIds = reportsService.uniqueItemsArray(results, "test_id");
                        return _getTestsByIds(testIds).then(function (response) {
                            results = _addToResultsTestsName(results, response);
                            return results;
                        });
                    }
                });
            });
        }

        function _getStudentIdIsLogged() {
            return  authService.isLogged().then(function(response) {
                return response.id;
            });
        }


        function _getResultsByStudent(student_id) {
            return $http.get(BASE_URL + URL.ENTITIES.RESULT + URL.GET_RESULTS_BY_STUDENT + "/" + student_id)
                .then(_successCallback, _errorCallback);
        }

        function _addToResultsTestsName(arrayResults, arrayTests) {
            var resultsWithTestName = [];
            angular.forEach(arrayTests, function(test) {
                var filteredArray = arrayResults.filter(function(result) {
                    if (result.test_id === test.test_id) {
                        result.test_name = test.test_name;
                        return true;
                    }
                });
                resultsWithTestName = resultsWithTestName.concat(filteredArray);
            });

            return resultsWithTestName;
        }

        function _getTestsByIds(testIds) {
            return entityService.getEntitiesById("Test", testIds).then(function (response) {
                return response;
            });
        }
        
        function getHeaderResults() {
            return ["Назва тесту", "Дата тестування", "Результат", "Якість"];
        }
    }
})();