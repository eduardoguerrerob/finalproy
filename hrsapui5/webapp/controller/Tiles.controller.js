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

        function onAfterRendering() {
            // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
            // pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
            var $genericTileFirmarPedido = this.byId("linkFirmarPedido");
            //Id del dom
            var idGenericTileFirmarPedido = $genericTileFirmarPedido.getId();
            //Se vacia el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        }

        function goToCreateEmployee() {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCreateEmployee", {}, false);
        }


        const Tiles = Controller.extend("egb.hrsapui5.controller.Tiles", {});

        Tiles.prototype.onInit=onInit;
        Tiles.prototype.onAfterRendering=onAfterRendering;
        Tiles.prototype.goToCreateEmployee=goToCreateEmployee;

        return Tiles;

    });