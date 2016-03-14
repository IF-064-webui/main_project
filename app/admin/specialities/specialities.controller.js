(function() {
    "use strict";

    angular.module("app.admin")
        .controller("SpecialitiesController", SpecialitiesController);

    SpecialitiesController.$inject = ["specialitiesService", "APP_CONST", "SPECIALITIES_CONST"];

    function SpecialitiesController (specialitiesService, APP_CONST, SPECIALITIES_CONST) {
        var vm = this;
        vm.showAddForm = showAddForm;
        vm.showEditForm = showEditForm;
        vm.addFormCollapsed = true;
        vm.editFormCollapsed = true;
        vm.newSpeciality = {};
        vm.editModel = {};
        vm.headElements = specialitiesService.getHeader();
        vm.addSpeciality = addSpeciality;
        vm.removeSpeciality = removeSpeciality;
        vm.editSpeciality = editSpeciality;
        vm.minNameLength = SPECIALITIES_CONST.MIN_NAME_LENGTH;
        vm.maxNameLength = SPECIALITIES_CONST.MAX_NAME_LENGTH;
        vm.maxSize = 5;
        vm.currentPage = 1;
        vm.currentRecordsRange = 0;
        vm.pageChanged = pageChanged;
        activate();

        function activate() {
            specialitiesService.totalItems().then(function(quantity) {
                vm.totalItems = +quantity;
            });
            specialitiesService.getSpecialitiesRange(vm.currentRecordsRange).then(function(data) {
                vm.list = data;
            });
        }

        function showAddForm() {
            vm.addFormCollapsed = !vm.addFormCollapsed;
            vm.editFormCollapsed = true;
        }

        function showEditForm(index, speciality) {
            vm.editFormCollapsed = false;
            vm.addFormCollapsed = true;
            vm.index = index;
            vm.editModel = {
                speciality_name: speciality.speciality_name,
                speciality_code: speciality.speciality_code
            };
        }

        function getSpecialities() {
            specialitiesService.getSpecialities().then(function(data) {
                vm.all = data;
            });
        }

        function addSpeciality() {
            specialitiesService.addSpeciality(vm.newSpeciality).then(function(data) {
                activate();
                vm.newSpeciality = {};
            })
        }

        function removeSpeciality(index) {
            vm.index = index
            specialitiesService.removeSpeciality(vm.list[vm.index].speciality_id).then(function(res) {
                activate();
            })
        }

        function editSpeciality() {
            specialitiesService.editSpeciality(vm.list[vm.index].speciality_id, vm.editModel).then(function(res) {
                activate();
            })
        }

        function getNextRange() {
            vm.currentRecordsRange =(vm.currentPage - 1) * APP_CONST.QUANTITY_ON_PAGE;
        }

        function pageChanged(){
            getNextRange();
            specialitiesService.getSpecialities(vm.currentRecordsRange).then(function(data) {
                vm.list = data;
            });

        }
    }
})();