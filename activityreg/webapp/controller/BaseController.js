sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, History, UIComponent) {
    "use strict";

    return Controller.extend("com.test.activityreg.controller.BaseController", {
      /**
       * Convenience method for accessing the event bus.
       * @protected
       * @returns {sap.ui.core.EventBus} the event bus for this component
       */
      getEventBus: function () {
        return this.getOwnerComponent().getEventBus();
      },
      /**
       * This function applies initial view settings like
       * 1. Content Density - Compact(Desktop) or Cozy(Mobile/Tablet)
       * @protected
       */
      initView: function () {
        if (sap.ui.Device.system.desktop) {
          // apply compact mode if touch is not supported
          this.getView().addStyleClass("sapUiSizeCompact");
        }
      },
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      /**
       * Convenience method for getting the view model by name.
       * @potected
       * @param {string} [sName] the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      //function to handle navigation
      onNavigationChangeHandler: function (oEvent) {
        let sSelectedKey = oEvent.getSource().getSelectedKey();
        let oCommonModel = this.getModel("mCommon");
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        switch (sSelectedKey) {
          case "AcadaemyRequest":
            oCommonModel.setProperty("/navigationSelectedKey", sSelectedKey);
            oCommonModel.refresh();
            oRouter.navTo("AcadaemyRequest");
            break;
          case "CXRFP":
            oCommonModel.setProperty("/navigationSelectedKey", sSelectedKey);
            oCommonModel.refresh();
            oRouter.navTo("CXRFP");
            break;
          case "CXDesign":
            oCommonModel.setProperty("/navigationSelectedKey", sSelectedKey);
            oCommonModel.refresh();
            oRouter.navTo("CXDesign");
            break;
          default:
            oCommonModel.setProperty(
              "/navigationSelectedKey",
              "ActivityRegistration"
            );
            oCommonModel.refresh();
            oRouter.navTo("ActivityRegistration");
        }
      },

      //Function to make service call for testing
      onServiceCall: function () {
        debugger;
        let sModelUrlPath = this.getOwnerComponent().getManifestEntry(
          "/sap.app/dataSources/mainService/uri"
        );
        let sModelServiceUrl =
          this.getView().getModel("mDefaultODataModel").sServiceUrl;
        let sAppRouterUrl = sModelServiceUrl.substr(
          0,
          sModelServiceUrl.length - sModelUrlPath.length
        );
        let sURL = sAppRouterUrl + "/v2/northwind/northwind.svc/Products";
        $.ajax({
          type: "GET",
          contentType: "application/json",
          url: sURL,
          dataType: "json",
          async: false,
          success: function (data, textStatus, jqXHR) {
            debugger;
            alert(
              "Service call to fetch the products(ODATA) data executed. Please check the network"
            );
          },
        });
      },
    });
  }
);
