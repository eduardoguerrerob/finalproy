// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/UploadCollectionParameter",
    "sap/m/MessageBox"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     * @param {typeof sap.m.MessageBox} MessageBox
     */
    function (Controller, UploadCollectionParameter, MessageBox) {

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

        function onDeleteEmployee(oEvent){
            MessageBox.confirm();
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
    });