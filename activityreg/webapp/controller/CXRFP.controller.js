sap.ui.define(
  ["com/test/activityreg/controller/BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend(
      "com.test.activityreg.controller.CXRFP",
      {
        onInit: function () {
          let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter
            .getRoute("CXRFP")
            .attachMatched(this._onRouteMatched, this);
        },

        //function to handle routeMatched
        _onRouteMatched: function (oEvent) {
          let key = oEvent.getParameter("name");
          let oCommonModel = this.getModel("mCommon");
          let aNavData = $.extend(
            true,
            [],
            oCommonModel.getProperty("/aNavigation")
          );
          let oNavData = aNavData.find((oNav) => {
            return oNav.key === key;
          });
          oCommonModel.setProperty("/navigationSelectedKey", oNavData.key);
          oCommonModel.refresh();
        },
      }
    );
  }
);
