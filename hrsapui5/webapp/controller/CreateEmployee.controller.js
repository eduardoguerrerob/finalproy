// @ts-nocheck
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

        function onBeforeRendering() {
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

            switch (employeeType) {
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

            if (this._wizard.getCurrentStep() === $wizardStep1.getId()) {
                this._wizard.nextStep();
            }
            else {
                this._wizard.goToStep($wizardStep2);
            }
        }


        function changeDataEmployee(oEvent, callback) {
            let objData = this._model.getData();
            let isOk = true;

            if (!objData.FirstName) {
                objData._FirstNameState = "Error";
                isOk = false;
            }
            else {
                objData._FirstNameState = "None";
            }

            if (!objData.LastName) {
                objData._LastNameState = "Error";
                isOk = false;
            }
            else {
                objData._LastNameState = "None";
            }

            if (!objData.CreationDate) {
                objData._CreationDateState = "Error";
                isOk = false;
            }
            else {
                objData._CreationDateState = "None";
            }

            if (!objData.Dni) {
                objData._DniState = "Error";
                isOk = false;
            }
            else {
                if (this.validationDni(objData.Dni, objData._type) === false) {
                    objData._DniState = "Error";
                    isOk = false;
                }
                else {
                    objData._DniState = "None";
                }

            }

            //go to next step, or invalidate
            if (isOk) {
                this._wizard.validateStep(this.getView().byId("wizardStep2"));
            }
            else {
                this._wizard.invalidateStep(this.getView().byId("wizardStep2"));
            }

            // callback
            if (callback) {
                callback(isOk);
            }
        }


        function validationDni(dni, type) {
            var dniOk = true;
            if (type !== "autonomo") {
                //var dni = oEvent.getParameter("value");
                //var dni = this._model.getData().Dni
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        dniOk = false;
                        //this._model.setProperty("/_DniState", "Error");
                    } else {
                        dniOk = true;
                        this._model.setProperty("/_DniState", "None");
                        //this.changeDataEmployee();
                    }
                } else {
                    dniOk = false;
                    this._model.setProperty("/_DniState", "Error");
                }
            }
            return dniOk;
        }


        function onChangeUploadCollection(oEvent) {
            let oUploadCollection = oEvent.getSource();
            let oToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oToken);
        }

        function onBeforeUploadStarts(oEvent) {
            let oSlug = new UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.EmployeeId+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oSlug);
        }

        function wizardCompletedHandler(oEvent) {
            this.changeDataEmployee(oEvent, function(isOk){
                if(isOk){
                    
                }
            }.bind(this));


            let $navContainer = this.getView().byId("wizardNavContainer");
            $navContainer.to(this.getView().byId("review"));


        }

        ////////////////////////////////////////////

        const CreateEmployee = Controller.extend("egb.hrsapui5.controller.CreateEmployee", {});

        CreateEmployee.prototype.onInit = onInit;
        CreateEmployee.prototype.onBeforeRendering = onBeforeRendering;
        CreateEmployee.prototype.goToStep2 = goToStep2;
        CreateEmployee.prototype.changeDataEmployee = changeDataEmployee;
        CreateEmployee.prototype.validationDni = validationDni;
        CreateEmployee.prototype.onChangeUploadCollection = onChangeUploadCollection;
        CreateEmployee.prototype.wizardCompletedHandler=wizardCompletedHandler;

        return CreateEmployee;

    });