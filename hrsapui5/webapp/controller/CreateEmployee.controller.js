sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        function onInit() {

        }

        function onBeforeRendering(){
            this._wizard = this.getView().byId("wizard");
            this._model = new sap.ui.model.json.JSONModel({});
            // set JSON model
            this.getView().setModel(this._model);
            // reset steps
            let oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
            this._wizard.goToStep(oFirstStep);
            oFirstStep.setValidated(false);
        }

        function goToStep2(oEvent) {
            const $wizardStep1 = this.getView().byId("wizardStep1");
            const $wizardStep2 = this.getView().byId("wizardStep2");
            // employee type selected
            const employeeType = oEvent.getSource().data("employeeType");

            let salary = 0;
            let type = "";

            switch(employeeType){
                case "interno":
                    salary = 24000;
                    type = "0";
                    break;
                case "autonomo":
                    salary = 400;
                    type = "1";
                    break;
                case "gerente":
                    salary = 70000;
                    type = "2";
                    break;
                default:
                    break;
            }

            this._model.setData({
                _type: employeeType,
                _type012: type,
                _salary: salary
            });
            
            if(this._wizard.getCurrentStep() === $wizardStep1.getId()){
                this._wizard.nextStep();
            }
            else{
                this._wizard.goToStep($wizardStep2);
            }
        }
        

        const CreateEmployee = Controller.extend("egb.hrsapui5.controller.CreateEmployee", {});

        CreateEmployee.prototype.onInit=onInit;
        CreateEmployee.prototype.onBeforeRendering=onBeforeRendering;
        CreateEmployee.prototype.goToStep2=goToStep2;

        return CreateEmployee;

    });