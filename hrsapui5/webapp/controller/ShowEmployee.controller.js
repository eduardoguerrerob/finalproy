// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/UploadCollectionParameter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.MessageToast} MessageToast
     */
    function (Controller, UploadCollectionParameter, MessageBox, MessageToast) {

        function onInit() {
            this._splitApp = this.getView().byId("splitApp");
        }

        function onBack(oEvent) {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteTiles", {}, true);
        }

        function onSelectedEmployee(oEvent) {
            this._splitApp.to(this.createId("detailsEmployee"));
            const objContext = oEvent.getParameter("listItem").getBindingContext("odataModel").getObject();
            this.employeeId = objContext.EmployeeId;

            const $detailsEmployee = this.getView().byId("detailsEmployee");
            $detailsEmployee.bindElement("odataModel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");
        }

        function onDownloadFile(oEvent) {
            let sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
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
                value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oSlug);
        }

        function onUploadComplete(oEvent) {
            let oUploadCollection = oEvent.getSource();
            oUploadCollection.getBinding("items").refresh();
        }

        function onFileDeleted(oEvent) {
            const oUploadCollection = oEvent.getSource();
            const sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
            this.getView().getModel("odataModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {
                }
            });
        }

        function onDeleteEmployee(oEvent) {
            const oResourceBoundle = this.getView().getModel("i18n").getResourceBundle();
            MessageBox.confirm(oResourceBoundle.getText("confirmarBorrado"), {
                onClose: function (oAction) {
                    if (oAction === 'OK') {
                        let path = "/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')";
                        this.getView().getModel("odataModel").remove(path, {
                            success: function () {
                                MessageToast.show(oResourceBoundle.getText("empleadoBorrado"));
                                this._splitApp.to(this.createId("startPage"));
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }
                        })
                    }
                }.bind(this)
            });
        }

        function onRiseEmployee(oEvent) {
            if (!this.riseDialog) {
                this.riseDialog = sap.ui.xmlfragment("egb.hrsapui5.fragment.RiseEmployee", this);
                this.getView().addDependent(this.riseDialog);
            }
            let riseModel = new sap.ui.model.json.JSONModel({});
            this.riseDialog.setModel(riseModel, "riseModel");
            this.riseDialog.open()
        }

        function onAcceptRise(oEvent) {
            let riseModel = this.riseDialog.getModel("riseModel");
            let objData = riseModel.getData();
            let body = {
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.employeeId,
                Ammount: objData.Ammount,
                CreationDate: objData.CreationDate,
                Comments: objData.Comments
            };
            this.getView().setBusy(true);
            let odataModel = this.getView().getModel("odataModel");
            odataModel.create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoOk"));
                    this.onCloseRiseDialog();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoKo"));
                }.bind(this)
            });
        }

        function onCloseRiseDialog(){
            this.riseDialog.close();
        }

        ///////////////////////////////////////////////

        const ShowEmployee = Controller.extend("egb.hrsapui5.controller.ShowEmployee", {});

        ShowEmployee.prototype.onInit = onInit;
        ShowEmployee.prototype.onBack = onBack;
        ShowEmployee.prototype.onSelectedEmployee = onSelectedEmployee;
        ShowEmployee.prototype.onDownloadFile = onDownloadFile;
        ShowEmployee.prototype.onChangeUploadCollection = onChangeUploadCollection;
        ShowEmployee.prototype.onBeforeUploadStarts = onBeforeUploadStarts;
        ShowEmployee.prototype.onUploadComplete = onUploadComplete;
        ShowEmployee.prototype.onFileDeleted = onFileDeleted;
        ShowEmployee.prototype.onDeleteEmployee = onDeleteEmployee;
        ShowEmployee.prototype.onRiseEmployee = onRiseEmployee;
        ShowEmployee.prototype.onAcceptRise = onAcceptRise;
        ShowEmployee.prototype.onCloseRiseDialog = onCloseRiseDialog;
    });