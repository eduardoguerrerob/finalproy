// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     */
    function (Controller, MessageBox, UploadCollectionParameter) {
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
                Type: type,
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
            var oUploadCollection = oEvent.getSource();
            var oToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oToken);
        }

        function onBeforeUploadStarts(oEvent) {
            var oSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId+";"+this.newEmployee+";"+oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oSlug);
        }

        function wizardCompletedHandler(oEvent) {
            this.changeDataEmployee(oEvent, function (isOk) {
                if (isOk) {
                    let $navContainer = this.getView().byId("wizardNavContainer");
                    $navContainer.to(this.getView().byId("review"));
                    let $uploadCollection = this.getView().byId("uploadCollection");
                    const files = $uploadCollection.getItems();
                    const numFiles = files.length;
                    this._model.setProperty("/_numFiles");

                    if (numFiles > 0) {
                        let aFiles = [];
                        for (var idx in files) {
                            var objFile = {
                                fileName: files[idx].getFileName(),
                                type: files[idx].getMimeType()
                            }
                            aFiles.push(objFile);
                        }
                        this._model.setProperty("/_files", aFiles);
                    }
                    else {
                        this._model.setProperty("/_files", []);
                    }
                }
                else {
                    this._wizard.goToStep(this.getView().byId("wizardStep2"));
                }
            }.bind(this));

        }

        function _editStep(step) {
            var wizardNavContainer = this.byId("wizardNavContainer");
            //Se añade un función al evento afterNavigate, ya que se necesita 
            //que la función se ejecute una vez ya se haya navegado a la vista principal
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(step));
                //Se quita la función para que no vuelva a ejecutar al volver a nevagar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        }

        function editStep1(oEvent) {
            _editStep.bind(this)("wizardStep1");
        }

        function editStep2(oEvent) {
            _editStep.bind(this)("wizardStep2");
        }

        function editStep3(oEvent) {
            _editStep.bind(this)("wizardStep3");
        }

        function onSave(oEvent) {
            let objData = this.getView().getModel().getData();

            let body = {};
            /*
            for(var property in objData){
                if(property.indexOf("_") !== 0){
                    body[property] = objData[property];
                }
            }*/
            body.SapId = this.getOwnerComponent().SapId;
            body.FirstName = objData.FirstName;
            body.LastName = objData.LastName;
            body.Dni = objData.Dni;
            body.CreationDate = objData.CreationDate;
            body.Type = objData.Type;
            body.Comments = objData.Comments;
            body.UserToSalary = [{
                Ammount: parseFloat(objData._salary).toString(),
                Comments: objData.Comments,
                Waers: "EUR"
            }];

            let odataModel = this.getView().getModel("odataModel");

            //this.getView().setBusy(true);

            odataModel.create("/Users", body, {
                success: function (data) {
                    this.getView().setBusy(false);
                    this.newEmployee = data.EmployeeId;

                    let i18nModel = this.getView().getModel("i18n").getResourceBundle();
                    MessageBox.information(i18nModel.getText("usuarioCreado") + " " + this.newEmployee, {
                        onClose: function () {
                            let $wizardNavContainer = this.byId("wizardNavContainer");
                            $wizardNavContainer.back();
                            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteTiles", {}, true);
                        }.bind(this)
                    });
                    // upload files
                    let $uploadCollection = this.byId("uploadCollection");
                    $uploadCollection.upload();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                }.bind(this)
            });
        }

        function onCancel(oEvent) {
            let i18nModel = this.getView().getModel("i18n").getResourceBundle();
            MessageBox.confirm(i18nModel.getText("confirmarCancelacion"), {
                onClose: function (res) {
                    if (res === "OK") {
                        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteTiles", {}, true);
                    }
                }.bind(this)
            })

        }

        ////////////////////////////////////////////

        const CreateEmployee = Controller.extend("egb.hrsapui5.controller.CreateEmployee", {});

        CreateEmployee.prototype.onInit = onInit;
        CreateEmployee.prototype.onBeforeRendering = onBeforeRendering;
        CreateEmployee.prototype.goToStep2 = goToStep2;
        CreateEmployee.prototype.changeDataEmployee = changeDataEmployee;
        CreateEmployee.prototype.validationDni = validationDni;
        CreateEmployee.prototype.onChangeUploadCollection = onChangeUploadCollection;
        CreateEmployee.prototype.onBeforeUploadStarts=onBeforeUploadStarts;
        CreateEmployee.prototype.wizardCompletedHandler = wizardCompletedHandler;
        CreateEmployee.prototype.editStep1 = editStep1;
        CreateEmployee.prototype.editStep2 = editStep2;
        CreateEmployee.prototype.editStep3 = editStep3;
        CreateEmployee.prototype.onSave = onSave;
        CreateEmployee.prototype.onCancel = onCancel;

        return CreateEmployee;

    });