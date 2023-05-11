sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend(
      "com.test.activityreg.controller.ActivityRegistration",
      {
        onInit: function () {},

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
          let sURL = sAppRouterUrl + "v2/northwind/northwind.svc/Products";
          debugger;
          $.ajax({
            type: "GET",
            contentType: "application/json",
            url: sURL,
            dataType: "json",
            async: false,
            success: function (data, textStatus, jqXHR) {
              debugger;
            },
          });
        },
      }
    );
  }
);
