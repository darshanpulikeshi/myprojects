/*global QUnit*/

sap.ui.define([
	"comtest/activityreg/controller/ActivityRegistration.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ActivityRegistration Controller");

	QUnit.test("I should test the ActivityRegistration controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
