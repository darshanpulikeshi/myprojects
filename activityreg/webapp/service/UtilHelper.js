sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"com/melody/lib/util/Activity",
	"com/melody/lib/classes/Activity",
	"com/presalescentral/activityform/util/UtilHelper",
	"com/presalescentral/activityform/util/ServiceHelper"
], function (MessageToast, Filter, ActivityUtil, Activity, UtilHelper, ServiceHelper) {
	"use strict";
	return {

		initializeFormComponents: function (oController) {
			try {
				if (sap.ushell && sap.ushell.hasOwnProperty("Container")) {
					var oppoPath = "../../sap/fiori/pcopportunity/webapp";
					var attachmentPath = "../../sap/fiori/pcfileattachment/webapp";
					var url = document.location.ancestorOrigins["0"];
					if (url && url.includes("cfapps")) {
						oppoPath = "../../fiori/pcopportunity/webapp";
						attachmentPath = "../../fiori/pcfileattachment/webapp";
					}
					jQuery.sap.registerModulePath("com.presalescentral.opportunity", oppoPath);
					jQuery.sap.registerModulePath("com.presalescentral.pcfileattachment", attachmentPath);
				} else {
					jQuery.sap.registerModulePath("com.presalescentral.opportunity", "../../pcopportunity/webapp");
					jQuery.sap.registerModulePath("com.presalescentral.pcfileattachment", "../../pcfileattachment/webapp");
				}
				jQuery.sap.require("com.presalescentral.opportunity.Component");
				jQuery.sap.require("com.presalescentral.pcfileattachment.Component");
			} catch (err) {
				jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
				MessageToast.show("couldn't load Component " + err);
			}
		},

		initializeNewActivity: function (oController, data, oEvent, slGUID, bVal) {
			var that = this;
			if (oController.activityTypeId) {
				data.ActivityTypeId = oController.activityTypeId;
			}
			if (oController.oStorage.get("isCopied") === "X" && !oController.masterDataModel.getProperty("/isDataRead")) {
				var sActivityId = oController.oStorage.get("copiedActivity");
				oController.fnSetActivityType(oEvent, sActivityId);
				oController.masterDataModel.setProperty("/isCopied", true);
				return;
			}
			oController.ServiceHelper.initializeNewActivity(oController.oActFormODataModel, data).then(function (result) {
				var oActivityData = result.data;
				oController.formLayoutId = oActivityData.FormLayoutId;
				oController.masterDataModel.setProperty("/FormLayoutID", oController.formLayoutId);
				oController._oApplicationProperties.setProperty("/ActivityGuid", oActivityData.ActivityGuid);
				oController._oApplicationProperties.setProperty("/activityGuId", oActivityData.ActivityGuid);
				if (oController.oStorage.get("isCopied")) {
					oController.masterDataModel.setProperty("/isCopied", true);
					oController.defaultModel.setProperty("/ActivityGuid", oActivityData.ActivityGuid);
				} else {
					oController.setDraftDataToForm(oActivityData);
					if (bVal && !oController.serviceRequest) {
						that.getActivityTypeDesc(oController, oController.activityTypeId);
					}
					if (oController.cvaRetainFlag) {
						oController.oStorage.put("isCopied", "");
						oController.defaultModel.setProperty("/OpportunityNumber", "");
						if (oController.byId("UserListMulti_CRM")) {
							oController.byId("UserListMulti_CRM").removeSelections();
							oController.teamMap = {};
						}
						oController.createMode = "REG_NEW_ACT";
						var audienceLayout = oController.byId("actDetAudience");
						audienceLayout.getItems().filter(function (item) {
							item.setSelected(false);
						});
						oController.byId("opportunityCheck").fireSelect();
						oController.cvaRetainFlag = false;
						oController.masterDataModel.setProperty("/cvaRetainFlag", true);
						oController.byId("actTypeSel").setEditable(true);
						oController.initializeView();
						oController.opportunityComponentInstance.getRootControl().getController().getView().byId("pcOpportunityInput").setEditable(true);
						if (oController.serviceRequest) {
							that.fnSetServiceRequestUIFields(oController);
						} else {
							oController.byId("cvaAccount").setEditable(true);
							oController.handleActivitySelect();
						}
						var associateType = oController.oStorage.get("associateType");
						oController.oRegModel.setProperty("/associateType", associateType);
						oController.byId("opportunityCheck").fireSelect();
						//oController.oStorage.put("associateType", "");
					}
					if (oController.createMode === "NEW_ACTIVITY") {
						var actLead = {
							"ROLE": "ZOPRSL01",
							"NAME": oController._oView.getModel("user").getProperty("/UserName"),
							"ID": oController._oView.getModel("user").getProperty("/UserId"),
							"EMAIL": oController._oView.getModel("user").getProperty("/UserEmail")
						};
						oController.getView().getModel("opportunityModel").setProperty("/selectedOpportunityTeam/PRESALES_LEAD", actLead);
						if (oController.serviceRequest) {
							that.fnSetServiceRequestUIFields(oController);
						} else if (!slGUID) {
							oController.fnOpenSelectCreateFormType();
						} else {
							that.getSlActivityType(oController, slGUID);
						}
					}
				}
				oController.defaultModel.refresh(true);
				oController._oApplicationProperties.refresh(true);
			});
		},

		//Function to set view fields for service request Actvity types [C5221586 : 19/08/2021]
		fnSetServiceRequestUIFields: function (oController) {
			oController.handleActivitySelect("", oController.activityTypeId, oController.formLayoutId);
			switch (oController.activityTypeId) {
			case "0012":
				oController.oRegModel.setProperty("/associateType", 1);
				oController.oRegModel.setProperty("/registrationTypes/0/isEnabled", false);
				break;
			case "0015":
				oController.oRegModel.setProperty("/associateType", 0);
				break;
			case "0124":
				oController.oRegModel.setProperty("/associateType", 1);
				oController.oRegModel.setProperty("/registrationTypes/0/isEnabled", false);
				break;
			}

		},

		getGTMAreMasterData: function (oController) {
			oController.ServiceHelper.getGTMAreMasterData(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/SolArea", result.data.results);
			});
		},

		getConstantData: function (oController) {
			oController.ServiceHelper.getConstantData(oController.oActFormODataModel).then(function (result) {
				var oData = result.data.results;
				for (var index in oData) {
					oController.constants[oData[index].const_id] = oData[index];
				}
				oController.byId("actFormCommentInput").setIcon(oController.constants["0040"].field_value + oController.getOwnerComponent().getModel(
					"user").getProperty(
					"/UserId"));
			});
		},

		getCxrfpSolutions: function (oController) {
			var aFilter = [new Filter("OperationStatus", "EQ", "X")];
			if (oController._oApplicationProperties.getProperty("/isEditMode")) {
				aFilter.push(new Filter("OperationStatus", "EQ", ""));
			}
			var aCXRFPFilter = [new Filter({
				filters: [new Filter({
					filters: aFilter,
					bAnd: false
				}), new Filter("GTMAreaId", "EQ", oController.activityTypeId === "0012" ? "0005" : "0007")],
				bAnd: true
			})];
			oController.ServiceHelper.getCxrfpSolutions(oController.oActFormODataModel, aCXRFPFilter).then(function (result) {
				oController.masterDataModel.setProperty("/CXRFPSol", result.data.results);
			});
		},

		getMethodData: function (oController, ActivityTypeId) {
			var aFilter = [];
			if (ActivityTypeId) {
				aFilter = [new Filter("acttypeid", "EQ", ActivityTypeId)];
			}
			oController.ServiceHelper.getMethodData(oController.oActFormODataModel, aFilter).then(function (result) {
				var bVal = false;
				var sInactiveMsg = "";
				var oData = result.data.results;
				var methodId = oController.defaultModel.getProperty("/MethodId");
				var methodDescription = oController.defaultModel.getProperty("/MethodDescription");
				oData.filter(function (item) {
					if (item.methodid === methodId) {
						bVal = true;
					}
				});
				if (!bVal && oController._oApplicationProperties.getProperty("/isEditMode")) {
					sInactiveMsg = methodDescription + " is inactive now. Please select new Method to update the activity.";
					oController.masterDataModel.setProperty("/InactiveDetMethod", sInactiveMsg);
					oController.masterDataModel.setProperty("/isMethodOldVal", true);
					var path = "/SelectedLayout/Method/Visible";
					var isBtnVisible = oController.getOwnerComponent().getModel("layouts").getProperty(path);
					oController.byId("inActiveMethodMsg").setVisible(isBtnVisible);
					oController.defaultModel.setProperty("/MethodId", "");
					oController.dataChange = true;
				} else {
					oController.byId("inActiveMethodMsg").setVisible(false);
					oController.masterDataModel.setProperty("/isMethodOldVal", false);
				}
				oController.masterDataModel.setProperty("/methodData", oData);
				oController.masterDataModel.refresh(true);
				//Below code added as dropdown was not populating during register another case
				if (oController.byId("methodSel")) {
					var methodSel = oController.byId("methodSel");
					methodSel.unbindAggregation("items");
					var oItemTemplate = new sap.ui.core.Item({
						text: "{masterDataModel>description}",
						key: "{masterDataModel>methodid}"
					});
					methodSel.bindAggregation("items", {
						path: "masterDataModel>/methodData",
						template: oItemTemplate,
						templateShareable: false
					});
					if (!ActivityTypeId) {
						ActivityTypeId = oController.defaultModel.getProperty("/ActivityTypeId");
					}
					oController.byId("methodSel").getBinding("items").filter(new Filter({
						path: "acttypeid",
						operator: "EQ",
						value1: ActivityTypeId
					}));
				}
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 0);
			});
		},

		getCountryMasterData: function (oController) {
			oController.ServiceHelper.getCountryMasterData(oController.oActFormODataModel).then(function (result) {
				oController.oRegModel.setProperty("/countryMaster", result.data.results);
			});
		},

		getRoleMasterData: function (oController) {
			var that = this;
			oController.ServiceHelper.getRoleMasterData(oController.oActFormODataModel).then(function (result) {
				var oRegModel = oController.oRegModel;
				var oData = result.data.results;
				oRegModel.setProperty("/roles", oData);
				var defaultRole = oData.filter(function (obj) {
					if (obj.DefaultRole === "X") {
						return obj;
					}
				});
				var roleMapId = "";
				if (defaultRole.length === 0) {
					defaultRole = "0001";
					roleMapId = "001";
				} else {
					roleMapId = defaultRole[0].RoleMpngID;
					defaultRole = defaultRole[0].RoleID;
				}
				oRegModel.setProperty("/role", defaultRole);
				oRegModel.setProperty("/RoleMpngID", roleMapId);
				oRegModel.setProperty("/defaultRole", defaultRole);
				that.getRoleBasedActivityTypes(oController);
			});
		},

		getRoleBasedActivityTypes: function (oController) {
			var oRegModel = oController.oRegModel;
			var role = oRegModel.getProperty("/role");
			var associateType = oRegModel.getProperty("/associateType");
			if (associateType === 0) {
				associateType = 501;
			} else if (associateType === 1) {
				associateType = 502;
			} else if (associateType === 2) {
				associateType = 503;
			}
			//if ActivtyTypeCatznID = 0001 -> Normal Activity Types
			//if ActivtyTypeCatznID = 0002 -> Service Request Activity Types
			var aFilter = [new Filter("ActivtyTypeCatznID", "EQ", "0001"), new Filter("ActvtAsstdID", "EQ",
				associateType), new Filter("operation_status", "EQ",
				true)];
			oController.ServiceHelper.getRoleBasedActivityTypes(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.oRegModel.setProperty("/ActivityTypes", result.data.results);
			});
		},

		//Function set data to Registration Model onInit
		getRegistrationModelData: function (oController) {
			var oData = {
				registrationTypes: [{
					name: "Account",
					type: true,
					key: "ACCOUNT",
					isEnabled: true
				}, {
					name: "Opportunity",
					type: false,
					key: "OPPORTUNITY",
					isEnabled: true
				}, {
					name: "No Association",
					type: false,
					key: "ACTIVITYSET",
					isEnabled: true
				}],
				associateTypeColumns: 1,
				associateType: oController.OppoSetListNavigation ? 1 : 0,
				eventTitle: "",
				account: "",
				opportunity: "",
				region: "",
				subRegion: "",
				industry: "",
				role: "",
				activityType: "",
				title: "Activity Registration",
				isvaluHelpSelected: true,
				activityDesc: "",
				customerName: "",
				accountOppoLabel: "Select Account"
			};
			//setting previously selected associate type in case of register another
			if (oController.createMode === "REG_NEW_ACT" && oController.oStorage.get("associateType")) {
				oData.associateType = oController.oStorage.get("associateType");
				oData.registrationTypes.filter(function (item, index) {
					if (index === oData.associateType) {
						item.type = true;
					} else {
						item.type = false;
					}
				});
			}
			oController.oRegModel.setData(oData);
		},

		fnExtendUIControls: function (oController) {
			sap.m.GroupHeaderListItemRenderer.renderLIContent = function (rm, oLI) {
				var aItem = [];
				try {
					if (oLI.getOpportunityTitle() !== null && oLI.getAggregation("actionButtons") !== null) {
						aItem.push(oLI.getOpportunityTitle());
						aItem.push(oLI.getAggregation("actionButtons"));
						var oFlex = new sap.m.FlexBox({
							alignItems: "Start",
							justifyContent: "SpaceBetween",
							wrap: (oController.getView().getModel("device").getProperty("/system/phone")) ? "Wrap" : "NoWrap",
							items: aItem
						}).addStyleClass("flexBoxWraping");
						rm.write("<span style='width:100%' ");
						rm.write(">");
						rm.renderControl(oFlex);
						rm.write("</span>");
					}
				} catch (oerror) {
					jQuery.sap.log.info(oerror);
					if (!rm.write) {
						rm.openStart("div");
						rm.openEnd();
						rm.openStart("span");
						rm.openEnd();
						rm.text(oLI.getTitle());
						rm.close("span");
						rm.close("div");
					} else {
						rm.write("<div>");
						rm.write("<span>" + oLI.getTitle() + "</span></div>");
					}
				}
			}.bind(oController);

			var oView = oController.getView();
			var addOppMultiInput = oView.byId("additionalOpptMultiInput");
			addOppMultiInput.addValidator(function (args) {
				if (args) {
					var text = args.text;
					oController._oApplicationProperties.setProperty("/isAppBusy", true);
					var aFiters = [new Filter("OPPT_ID", "EQ", text)];
					oController.opportunityComponentInstance.getModel("oppServerModel").read(
						"/Opportunities/$count", {
							filters: aFiters,
							success: function (oData) {
								oController._oApplicationProperties.setProperty("/isAppBusy", false);
								if (oData === "1") {
									MessageToast.show("Opportunity Added");
									oController.handleAddOppSelection(text, true);
									oController.byId("additionalOpptMultiInput").setValue("");
									var addOppList = oController.byId("additionalOpptList").getItems();

									$.each(addOppList, function (index, item) {
										if (text === item.getInfo()) {
											item.setSelected(true);
										}
									});
								} else {
									MessageToast.show("invalid opportunity number");
									oController.byId("additionalOpptMultiInput").setValue("");
								}
							},
							error: function (oError) {
								oController._oApplicationProperties.setProperty("/isAppBusy", false);
								jQuery.sap.log.info(oError);
							}
						});
				}
			});
		},

		//Activity Information Dropdown services - Start 
		getActivitySets: function (oController, bVal) {
			oController.ServiceHelper.getActivitySets(oController.oActFormODataModel).then(function (result) {
				var i = 0,
					isActvtSetPresent = false;
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				var masterDataModel = oController.masterDataModel;
				var activitySetId = defaultModel.getProperty("/ActivitySetId");
				var activitySetDesc = defaultModel.getProperty("/ActivitySetdescription");
				var isEditMode = oController._oApplicationProperties.getProperty("/isEditMode");
				oData.filter(function (obj, index) {
					if (obj.ActivitySetId === activitySetId) {
						i = index;
						isActvtSetPresent = true;
						if (isEditMode && obj.Region && obj.SubRegion && obj.ProfitCenter) {
							oController.oRegModel.setProperty("/Region", obj.Region);
							oController.oRegModel.setProperty("/MU", obj.SubRegion);
							oController.oRegModel.setProperty("/ProfitCenter", obj.ProfitCenter);
							oController.handleRegionChange(undefined, obj.Region, obj.SubRegion);
						}
					}
				});
				if (!isActvtSetPresent && activitySetId && activitySetDesc) {
					var oActivitSet = {
						ActivitySetId: activitySetId,
						Description: activitySetDesc
					};
					oData.push(oActivitSet);
				} else if (i) {
					activitySetDesc = oData[i].Description;
				}
				masterDataModel.setProperty("/Yc_Mac_M_Actity_Set", oData);
				if (activitySetId && activitySetDesc) {
					oController.oRegModel.setProperty("/eventTitle", activitySetDesc);
					oController.byId("actSetSel").setValue(activitySetDesc);
				}
				if (bVal) {
					if (oController.byId("ACT_SEL_REG_POP_UP")) {
						oController.byId("ACT_SEL_REG_POP_UP").setBusy(false);
					}
					if (oController.defaultModel.getProperty("/ActivityTypeId")) {
						oController.closeRegistrationDialog();
					}
				}
			});
		},

		getActInfoRegion: function (oController, formLayoutId) {
			var aFilter = [];
			if (oController.activityTypeId) {
				aFilter = [new Filter("ActvtTypeId", "EQ", oController.activityTypeId)];
			}
			oController.ServiceHelper.getActInfoRegion(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_REGION", result.data.results);
				if (oController.createMode === "NEW_ACTIVITY" || oController.createMode === "REG_NEW_ACT") {
					var isCopied = oController.masterDataModel.getProperty("/isCopied");
					if (!isCopied) {
						oController.setDefaultRegion(oController.getOwnerComponent().getModel("user").getProperty("/RegionId"), oController.activityTypeId);
					}
				}
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false);
			});
		},

		getActInfoIndustry: function (oController, formLayoutId) {
			var aFilter = [];
			if (oController.activityTypeId) {
				aFilter = [new Filter("ActvtTypeId", "EQ", oController.activityTypeId)];
			}
			oController.ServiceHelper.getActInfoIndustry(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_INDUSTRY", result.data.results);
				if (oController.formLayoutId === "00023") {
					oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
				}
			});
		},

		getActInfoMu: function (oController, sActivityTypeId) {
			var sRegionId = oController.defaultModel.getProperty("/ActvtRegion");
			var aFilter = [new Filter("RegionId", "EQ", sRegionId), new Filter("ActvtTypeId", "EQ", sActivityTypeId)];
			oController.ServiceHelper.getActInfoMu(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_MU", result.data.results);
			});
		},

		getCXRFPStatus: function (oController, formLayoutId) {
			oController.ServiceHelper.getCXRFPStatus(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_CXRFP_STAT", result.data.results);
				if (formLayoutId === "00012") {
					oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 0);
				}
			});
		},

		//Activity Information Dropdown services - End 
		//Activity Detail Dropdown services - 
		getActivityDetailTypes: function (oController) {
			oController.ServiceHelper.getActivityDetailTypes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/Yc_Mac_M_Activity_Det_Type", result.data.results);
			});
		},

		getActDetSalesLOB: function (oController) {
			oController.ServiceHelper.getActDetSalesLOB(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_SALES_LOB", result.data.results);
			});
		},

		getActDetBusinessAreaEngaged: function (oController, ActvtTypeID) {
			oController.ServiceHelper.getActDetBusinessAreaEngaged(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_BSNSAREAENGD", result.data.results);
				ActvtTypeID = oController.activityTypeId;
				if (!ActvtTypeID) {
					ActvtTypeID = oController.defaultModel.getProperty("/ActivityTypeId");
				}
				if (ActvtTypeID) {
					oController.byId("bsAreaEngagedSel").getBinding("items").filter(new Filter({
						path: "ActvtTypeID",
						operator: "EQ",
						value1: ActvtTypeID
					}));
				}
			});
		},

		getActDetRiskButtons: function (oController, formLayoutId) {
			oController.ServiceHelper.getActDetRiskButtons(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/Yc_Mac_M_Risk_Asses", result.data.results);
				oController.fnSetActDetailGridsBusy("idActivityDetails", false, 1);
			});
		},

		getActDetDMChildValues: function (oController) {
			oController.ServiceHelper.getActDetDMChildValues(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_DM_CHILD_VALUES", result.data.results);
			});
		},

		getActDetScopes: function (oController, ActivityTypeId) {
			oController.ServiceHelper.getActDetScopes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_SCOPE", result.data.results);
			});
		},

		getActDetEngagementTypes: function (oController, formLayoutId) {
			oController.ServiceHelper.getActDetEngagementTypes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_ENG_TYPE", result.data.results);
				if (formLayoutId === "00015" || formLayoutId === "00020") {
					oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
				}
			});
		},

		getActDetProjectStatus: function (oController, formLayoutId) {
			oController.ServiceHelper.getActDetProjectStatus(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_ACTVT_STATUS", result.data.results);
				if (formLayoutId === "00017" || formLayoutId === "00021") {
					oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
				}
			});
		},

		getActDetProjectTypes: function (oController) {
			oController.ServiceHelper.getActDetProjectTypes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_PROJ_TYPE", result.data.results);
			});
		},

		getActDetHostTypes: function (oController) {
			oController.ServiceHelper.getActDetHostTypes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_HOST_TYPE", result.data.results);
			});
		},

		getActDetUseCase: function (oController) {
			oController.ServiceHelper.getActDetUseCase(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_USE_CASE", result.data.results);
			});
		},

		getActDetDeliveryTeam: function (oController) {
			oController.ServiceHelper.getActDetDeliveryTeam(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_DELV_TEAM", result.data.results);
			});
		},

		getActDetVendorId: function (oController) {
			oController.ServiceHelper.getActDetVendorId(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_VENDOR", result.data.results);
			});
		},

		getActDetTAOptions: function (oController) {
			oController.ServiceHelper.getActDetTAOptions(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_TA_OPT", result.data.results);
				var items = result.data.results;
				items.sort(function (a, b) {
					var Desc1 = a.TADesc.toUpperCase();
					var Desc2 = b.TADesc.toUpperCase();
					if (Desc1 < Desc2) {
						return -1;
					}
					if (Desc1 > Desc2) {
						return 1;
					}
					return 0;
				});
				var itemIndex;
				//This change is done to place Hackathon Index at the bottom as per GIT #210
				items.find(function (object, index) {
					if (object.TAId === "0028") {
						itemIndex = index;
					}
				});
				items.push(items.splice([itemIndex], 1)[0]);
			});
		},

		getActDetImpact: function (oController) {
			oController.ServiceHelper.getActDetImpact(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_IMPACT", result.data.results);
			});
		},

		getActDetPreferDCID: function (oController) {
			oController.ServiceHelper.getActDetPreferDCID(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_DC_MASTER", result.data.results);
			});
		},

		getActDetPhase: function (oController, ActivityTypeId) {
			var aFilter = [];
			if (ActivityTypeId) {
				aFilter = [
					new Filter("ActivityTypeId", "EQ", ActivityTypeId)
				];
			}
			oController.ServiceHelper.getActDetPhase(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.phaseMap = {};
				var data = result.data.results;
				data.filter(function (obj, index) {
					oController.phaseMap[obj.PhaseId] = {
						"counter": 0,
						"index": index
					};
				});
				var oPhaseVBox = oController.byId("phaseVbox").getItems();
				oPhaseVBox.filter(function (obj, index) {
					obj.getItems()[2].getItems()[1].getBinding("items").filter([new Filter("acttypeid", "EQ",
						oController.defaultModel.getProperty("/ActivityTypeId"))]);
				});
				oController.masterDataModel.setProperty("/YC_MAC_M_PHASE", data);
			});
		},

		getActDetAudience: function (oController) {
			oController.ServiceHelper.getActDetAudience(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_AUDIENCE", result.data.results);
			});
		},
		//Activity Detail Dropdown services - End

		getActSetIndustry: function (oController) {
			oController.ServiceHelper.getActSetIndustry(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MOP_INDUSTRY", result.data.results);
			});
		},

		getAttachmentTypes: function (oController) {
			oController.ServiceHelper.getAttachmentTypes(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_ATTACH_TYPE", result.data.results);
			});
		},

		getDemoDataCenters: function (oController) {
			oController.ServiceHelper.getDemoDataCenters(oController.oActFormODataModel).then(function (result) {
				var data = result.data.results;
				oController.dcMap = {};
				data.filter(function (obj, index) {
					oController.dcMap[obj.dc_id] = {
						"counter": 0,
						"index": index
					};
				});
				oController.masterDataModel.setProperty("/Yc_Mac_M_Datacenter", data);
			});
		},

		getAuthFlag: function (oController, oActivityId, oActivityTypeId) {
			var aFilter = [new Filter("acttypeid", "EQ", oActivityTypeId),
				new Filter("ActivityId", "EQ", oActivityId)
			];
			oController.ServiceHelper.getAuthFlag(oController.oActFormODataModel, aFilter).then(function (result) {
				var results = result.data.results[0];
				oController._oApplicationProperties.setProperty("/authFlag", results.auth_flag);
				oController._oApplicationProperties.setProperty("/TopDealAccess", results.TopDealAccess);
				oController._oApplicationProperties.setProperty("/copyTopDealAccess", results.TopDealAccess);
				oController._oApplicationProperties.setProperty("/DemoEditAccess", results.DemoEditAccess);
				var mainSolId = oController.defaultModel.getProperty("/MainSolutionId");
				if (mainSolId === "1039" || mainSolId === "1016" || mainSolId === "1105" || mainSolId === "1095" || mainSolId === "1040" ||
					mainSolId === "1108" || oController._oApplicationProperties.getProperty("/copyTopDealAccess") === "X") {
					oController._oApplicationProperties.setProperty("/TopDealAccess", "X");
				} else {
					oController._oApplicationProperties.setProperty("/TopDealAccess", "");
				}
			});
		},

		getActivityTypeDesc: function (oController, oActivityId, serviceReqActivityTypeDesc) {
			var that = this;
			var aFilter = [new Filter("ActvtTypeID", "EQ", oActivityId)];
			if (oController.masterDataModel.getProperty("/RoleID")) {
				aFilter.push(new Filter("RoleMpngID", "EQ", oController.masterDataModel.getProperty("/RoleID")));
			} else if (oController.defaultModel.getProperty("/RoleMpngID")) {
				aFilter.push(new Filter("RoleMpngID", "EQ", oController.defaultModel.getProperty("/RoleMpngID")));
			} else if (serviceReqActivityTypeDesc) {
				aFilter.push(new Filter("RoleMpngID", "EQ", "007"));
			}
			oController.ServiceHelper.getRoleBasedActivityTypes(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results[0];
				oController.formLayoutId = oData.FormLayoutID;
				oController.masterDataModel.setProperty("/FormLayoutID", oController.formLayoutId);
				if (!oController.defaultModel.getProperty("/ActivityTypeDescription") || !serviceReqActivityTypeDesc) {
					oController.defaultModel.setProperty("/ActivityTypeDescription", oData.ActvtTypeDesc);
				}
				oController.masterDataModel.setProperty("/ActivityTypeInfo", oData.ActivityTypeInfo);
				oController.masterDataModel.setProperty("/ActvtTypeID", oData.ActvtTypeID);
				oController.defaultModel.setProperty("/ActivityTypeId", oData.ActvtTypeID);
				that.fnSetActivityMTRDataSet(oController);
				if (serviceReqActivityTypeDesc || oController.serviceRequest || oController.createMode === "DETAIL_ACTIVITY") {
					oController.handleActivitySelect("", oData.ActvtTypeID, oData.FormLayoutID);
					oController.byId("ACT_FORM_PAGE_TITLE").setText(oController.defaultModel.getProperty("/ActivityTypeDescription"));
					return;
				}
				that.getFormLayoutData(oController);
			});
		},

		//Function to set MTR activity data set
		fnSetActivityMTRDataSet: function (oController) {
			var oActivityData = oController.defaultModel.getData();
			ActivityUtil.getUserActivities().then(function (activities) {
				var oActivity = activities.find(function (item) {
					return item.ActivityId === oActivityData.ActivityId;
				});
				if (!oActivity) {
					oController.byId("btnTimeRecording").setBusy(false);
					oController.byId("btnTimeRecording").setVisible(false);
				} else {
					oActivity.ProjectType = "ACTVT";
				}
				var MtrActivity = (oActivity) ? new Activity(oActivity) : null;
				oController.oMTRModel.setProperty("/MtrActivity", MtrActivity);
			});
		},

		getFormLayoutData: function (oController) {
			var aFilter = [new Filter("FormLayoutID", "EQ", oController.formLayoutId)];
			oController.ServiceHelper.getLayoutData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results[0];
				oController.masterDataModel.setProperty("/FormLayoutID", oData.FormLayoutID);
				var aLayoutFields = JSON.parse(oData.FormLayoutString).Fields;
				oController.getOwnerComponent().getModel("layouts").setProperty("/SelectedLayout", aLayoutFields);
			});
		},

		getPreferedDCMapping: function (oController, oActivityTypeId) {
			var aFilter = [new Filter("ActivityTypeId", "EQ", "0015")];
			oController.ServiceHelper.getPreferedDCMapping(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.PreferedDCMap = {};
				var oData = result.data.results;
				oData.filter(function (obj, index) {
					if (!oController.PreferedDCMap.hasOwnProperty(obj.Region)) {
						oController.PreferedDCMap[obj.Region] = obj.PrefDCId;
					}
				});
			});
		},

		getActivityTypeID: function (oController, ActivityId) {
			var that = this;
			ActivityId = ActivityId.replace(/^0+/, '');
			var aFilter = [new Filter("ActivityId", "EQ", ActivityId)];
			oController.ServiceHelper.getActivityTypeID(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results[0];
				// setting page title in case of service request - Edit mode
				if (oController.serviceRequest) {
					var sActTitle = "Details";
					if (oData.ActivityTypeId === "0012") {
						sActTitle = "CX RFP";
					} else if (oData.ActivityTypeId === "0124") {
						sActTitle = "CX Design Request";
					} else {
						sActTitle = "Academy Request";
					}
					oController.byId("ACT_FORM_PAGE_TITLE").setText(sActTitle);
				}
				that.getActTypeExpand(oController, oData.ActvtAsstdID, oData.ActivityGuid, oData.ActivityTypeId);
			});
		},

		getActTypeExpand: function (oController, ActvtAsstdID, ActivityGuid, ActivityTypeId) {
			var that = this;
			var aFilter = [new Filter("ActivityTypeId", "EQ", ActivityTypeId)];
			oController.ServiceHelper.getActTypeExpand(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results[0];
				var sEntitiyString = oData.EntityString;
				var aEntities = sEntitiyString.split(",");
				that.setActivityAssociations(oController, aEntities, ActvtAsstdID, ActivityGuid, ActivityTypeId, sEntitiyString);
			});
		},

		setActivityAssociations: function (oController, aEntities, ActvtAsstdID, ActivityGuid, ActivityTypeId, sEntitiyString) {
			var that = this;
			var defaultModel = oController.defaultModel;
			var userModel = oController.getOwnerComponent().getModel("user");
			var isCXRFPUser = userModel.getProperty("/CXRFP_User");
			var formLayoutId = oController.formLayoutId;
			var oPromise = Promise.resolve(function () {
				var m = 0;
			});

			if (ActvtAsstdID === "503") {
				var isAuthorized = defaultModel.getProperty("/Authorized");
				if (isAuthorized === "X" || (isCXRFPUser === "X" && formLayoutId === "00012")) {
					// oPromise.then(that.getActivitySets(oController));
					oPromise.then(that.getActSetIndustry(oController));
					oController.byId("actSetSel").setEnabled(true);
				} else {
					var activitySetId = defaultModel.getProperty("/ActivitySetId");
					var activitySetDesc = defaultModel.getProperty("/ActivitySetdescription");
					var oActivitSet = {
						ActivitySetId: activitySetId,
						Description: activitySetDesc
					};
					oController.masterDataModel.setProperty("/Yc_Mac_M_Actity_Set", [oActivitSet]);
				}
			}
			if (formLayoutId === "00026") {
				oPromise.then(that.getCxrfpSolutions(oController));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
				oPromise.then(that.getCxDesignRegionMu(oController));
				oPromise.then(that.getActInfoIndustry(oController, formLayoutId));
				oPromise.then(that.getRouteToMarket(oController));
				oPromise.then(that.getServiceRequestedData(oController));
			}
			aEntities.filter(function (entityName, index) {
				switch (entityName) {
				case "Yc_Mac_T_Cloud_Env":
					oPromise.then(that.getActCloudEnv(oController, ActivityGuid));
					oPromise.then(that.getDemoDataCenters(oController));
					break;
				case "Yc_Mac_T_Activity_Details_Type":
					oPromise.then(that.getActDetailType(oController, ActivityGuid));
					break;
				case "Yc_Mac_T_Landscapes":
					oPromise.then(that.getActLandscape(oController, ActivityGuid));
					break;
				case "YC_MAC_T_SOL_MTRL":
					oPromise.then(that.getActDetailMaterials(oController, ActivityGuid));
					break;
				case "YC_MAC_T_SOL_TXNMY":
					oPromise.then(that.getActDetailTaxonomy(oController, ActivityGuid));
					break;
				case "Yc_Mac_T_Solution":
					oPromise.then(that.getActDetailAddSolution(oController, ActivityGuid));
					break;
				case "Yc_Mac_T_Success_F":
					oPromise.then(that.getActSuccessFactors(oController, ActivityGuid));
					break;
				case "Yc_Mac_T_Actteam":
					oPromise.then(that.getActTeamMembers(oController, ActivityGuid));
					break;
				case "YC_MAC_T_AUDIENCE":
					oPromise.then(that.getActDetAudienceData(oController, ActivityGuid));
					break;
				case "YC_MAC_T_PHASE":
					oPromise.then(that.getActDetPhases(oController, ActivityGuid));
					break;
				case "YC_MAC_T_ADD_OPP":
					oPromise.then(that.getActAddOpportunities(oController, ActivityGuid));
					break;
				case "YC_MAC_T_BSNSARENGD":
					oPromise.then(that.getActDetBusinessAreaEng(oController, ActivityGuid));
					break;
				case "YC_MAC_T_FILE_CONTENT":
					oPromise.then(that.getActAttachments(oController, ActivityGuid));
					break;
				case "YC_MAC_T_COMMENTS":
					oPromise.then(that.getActComments(oController, ActivityGuid));
					break;
				case "YC_MAC_T_INDUSTRY":
					oPromise.then(that.getCxDesignIndustryData(oController, ActivityGuid));
					break;
				case "YC_MAC_T_ACT_REGION_MU":
					oPromise.then(that.getCxDesignRegionMuData(oController, ActivityGuid));
					break;
				case "YC_MAC_T_ROUTE_MARKET":
					oPromise.then(that.getCxDesignRouteToMarketData(oController, ActivityGuid));
					break;
				case "YC_MAC_T_SRV_REQUESTED":
					oPromise.then(that.getCxDesignServiceRequestedData(oController, ActivityGuid));
					break;
				}
			});
			if (formLayoutId === "00001" || formLayoutId === "00024") {
				oPromise.then(that.getActivityDetailTypes(oController));
				oPromise.then(that.getActDetDMChildValues(oController));
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getGTMAreMasterData(oController));
				oPromise.then(that.getLevel2MasterData(oController));
				oPromise.then(that.getSolutionHierarchy(oController));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				if (formLayoutId === "00001") {
					oPromise.then(that.getRegionMu(oController, ActivityTypeId));
				}
			} else if (formLayoutId === "00003" || formLayoutId === "00006") {
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getActivityDetailTypes(oController));
				oPromise.then(that.getActDetDMChildValues(oController));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00012") {
				oPromise.then(that.getCxrfpSolutions(oController));
				oPromise.then(that.getCXRFPStatus(oController, formLayoutId));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00014" || formLayoutId === "00016") {
				oPromise.then(that.getActInfoRegion(oController, formLayoutId));
			} else if (formLayoutId === "00015") {
				oPromise.then(that.getActInfoRegion(oController, formLayoutId));
				oPromise.then(that.getActDetTAOptions(oController, ActivityTypeId));
				oPromise.then(that.getActDetEngagementTypes(oController, formLayoutId));
				oPromise.then(that.getActDetPreferDCID(oController, ActivityTypeId));
				oPromise.then(that.getPreferedDCMapping(oController, ActivityTypeId));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00017") {
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getActDetEngagementTypes(oController, formLayoutId));
				oPromise.then(that.getActDetProjectStatus(oController, formLayoutId));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00018") {
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getActDetSalesLOB(oController, ActivityTypeId));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getActDetScopes(oController, ActivityTypeId));
				oPromise.then(that.getGTMAreMasterData(oController));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00019") {
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getGTMAreMasterData(oController));
				oPromise.then(that.getLevel2MasterData(oController));
				oPromise.then(that.getSolutionHierarchy(oController));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00020") {
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getActDetEngagementTypes(oController, formLayoutId));
				oPromise.then(that.getActDetProjectStatus(oController, formLayoutId));
			} else if (formLayoutId === "00021") {
				oPromise.then(that.getActDetRiskButtons(oController, formLayoutId));
				oPromise.then(that.getActDetEngagementTypes(oController, formLayoutId));
				oPromise.then(that.getActDetProjectStatus(oController, formLayoutId));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
			} else if (formLayoutId === "00022") {
				oPromise.then(that.getCountryMasterData(oController, ActivityTypeId));
				oPromise.then(that.getActDetImpact(oController, ActivityTypeId));
				oPromise.then(that.getActDetEngagementTypes(oController, formLayoutId));
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			} else if (formLayoutId === "00023") {
				oPromise.then(that.getMethodData(oController, ActivityTypeId));
				oPromise.then(that.getActInfoRegion(oController, formLayoutId));
				oPromise.then(that.getActInfoIndustry(oController, formLayoutId));
				oPromise.then(that.getActInfoMu(oController, ActivityTypeId));
				oPromise.then(that.getRegionMu(oController, ActivityTypeId));
			}

			oPromise.then(that.getActInfoAccountDetails(oController, ActivityGuid));
			oController._aMandatoryFields = oController._getMandatoryCreateFields();
			oPromise.then(that.fnFilterFormDropdowns(oController, ActivityTypeId));
			if (ActvtAsstdID === "503") {
				if (isAuthorized === "X" || (isCXRFPUser === "X" && formLayoutId === "00012")) {
					oPromise.then(that.getActivitySets(oController));
				}
			}
			this.fnExtendUIControls(oController);
			if (oController.oStorage.get("isCopied") === "X") {
				oController.byId("postDemoSurveyBtn").setVisible(false);
				if (oController.defaultModel.getProperty("/FormLayoutId") === "00012") {
					oController.defaultModel.setProperty("/ActvtStatus", "11");
				}
				oController._oApplicationProperties.setProperty("/isEditMode", false);
				setTimeout(function () {
					defaultModel.setProperty("/ActivityGuid", oController._oApplicationProperties.getProperty("/activityGuId"));
					defaultModel.setProperty("/cvaguid", oController._oApplicationProperties.getProperty("/activityGuId"));
					if (oController.defaultModel.getProperty("/FormLayoutId") !== "00020") {
						oController.oStorage.put("isCopied", "");
						oController.oStorage.put("copiedActivity", "");
					}
				}, 10000);
			} else if (defaultModel.getProperty("/SLActGUID") !== "00000000-0000-0000-0000-000000000000") {
				setTimeout(function () {
					that.disableSLFields(oController);
				}, 100);
			} else {
				oController._oApplicationProperties.setProperty("/isEditMode", true);
			}
		},

		fnFilterFormDropdowns: function (oController, ActivityTypeId) {
			oController.byId("methodSel").getBinding("items").filter(new Filter({
				path: "acttypeid",
				operator: "EQ",
				value1: ActivityTypeId
			}));
			oController.byId("customerEngmntLvl").getBinding("items").filter(new Filter({
				path: "ActivityTypeId",
				operator: "EQ",
				value1: ActivityTypeId
			}));
			oController.byId("taEngagementTypeSel").getBinding("items").filter(new Filter({
				path: "ActivityTypeId",
				operator: "EQ",
				value1: ActivityTypeId
			}));
			oController.byId("detImpact").getBinding("items").filter(new Filter({
				path: "actvt_type_id",
				operator: "EQ",
				value1: ActivityTypeId
			}));
			oController.byId("actDetAudience").getBinding("items").filter(new Filter({
				path: "ActvtTypeID",
				operator: "EQ",
				value1: ActivityTypeId
			}));
		},

		getActRegStatusMasterData: function (oController, activityGUID) {
			var that = this;
			oController.ServiceHelper.getActRegStatusMasterData(oController.oActFormODataModel).then(function (result) {
				var oData = result.data.results;
				var masterDataModel = oController.masterDataModel;
				masterDataModel.setProperty("/YC_MAC_M_STATUS_LIST", oData);
				that.fnSetCustomerValBtnVisible(oController, oData);
			});
		},

		//Function to find if Customer validated button can be visible for user
		fnSetCustomerValBtnVisible: function (oController) {
			var masterDataModel = oController.masterDataModel;
			var oStatusArr = masterDataModel.getProperty("/YC_MAC_M_STATUS_LIST");
			var RequestorRegHC = oController.defaultModel.getProperty("/RequestorRegHC");
			var oSearchedObj = oStatusArr.find(function (object) {
				return ((object.RegionHc === RequestorRegHC && object.StatusId === "14") || (object.RegionHc === "*" && object.StatusId === "14"));
			});
			if (oSearchedObj) {
				masterDataModel.setProperty("/isCustomerValVisible", true);
			} else {
				masterDataModel.setProperty("/isCustomerValVisible", false);
			}
		},

		getActInfoAccountDetails: function (oController, activityGUID) {
			oController.ServiceHelper.getActInfoAccountDetails(oController.oActFormODataModel, activityGUID).then(function (result) {
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				defaultModel.setProperty("/to_AAccnt", oData);
			});
		},

		getActCloudEnv: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActCloudEnv(oController.oActFormODataModel, aFilter).then(function (result) {
				var tempCloud = [];
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				oData.filter(function (obj, index) {
					if (obj.Description.trim() !== "" || obj.Instance.trim() !== "") {
						tempCloud.push(obj);
					}
				});
				defaultModel.setProperty("/to_ACloudEnv", tempCloud);
				if (defaultModel.getProperty("/FormLayoutId") === "00001" || defaultModel.getProperty("/FormLayoutId") === "00024") {
					oController.byId("tblCloudTenant").setVisible((oData && oData.length > 0) ? true : false);
					oController.fnSetActDetailPanelsBusy("idActivityDemoEnv", false);
				}
			});
		},

		getActDetailType: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActDetailType(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var oTempArr = oData.map(function (obj) {
					return obj.TypeId;
				});
				var defaultModel = oController.defaultModel;
				defaultModel.setProperty("/to_ADetType", oData);
				oController.byId("typeSel").setSelectedKeys(oTempArr);
				oController.byId("eventTypeSel").setSelectedKey(oTempArr[0]);
				var formLayoutId = defaultModel.getProperty("/FormLayoutId");
				if (formLayoutId === "00003" || formLayoutId === "00006") {
					oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 1);
					oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
				}
				/*	Updates to the Demo form #197*/
				var aInactiveTypes = [];
				var sInactiveMsg = "";
				oData.filter(function (item) {
					if (!item.OperationStatus) {
						aInactiveTypes.push(item.Description);
					}
				});
				if (aInactiveTypes.length && oController._oApplicationProperties.getProperty("/isEditMode")) {
					if (aInactiveTypes.length > 1) {
						sInactiveMsg = aInactiveTypes.join(", ") + "  are inactive now. Please select new Type to update the activity.";
					} else {
						sInactiveMsg = aInactiveTypes.join(", ") + "  is inactive now. Please select new Type to update the activity.";
					}
					oController.masterDataModel.setProperty("/InactiveDetType", sInactiveMsg);
					oController.byId("inActiveTypeMsg").setVisible(true);
					oController.dataChange = true;
				} else {
					oController.byId("inActiveTypeMsg").setVisible(false);
				}
			});
		},

		getActLandscape: function (oController, activityGUID) {
			var that = this;
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActLandscape(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oData.filter(function (obj, index) {
					oController.landscapeMap[obj.LandsId] = obj;
				});
				var defaultModel = oController.defaultModel;
				defaultModel.setProperty("/to_ALand", oData);
				that.getSapDemoEcData(oController);
				that.getDemoLandScapes(oController);
			});
		},

		getActDetailAddSolution: function (oController, activityGUID) {
			oController.ServiceHelper.getActDetailAddSolution(oController.oActFormODataModel, activityGUID).then(function (result) {
				var activeSol = [];
				var sInactiveMsg = "";
				var aCXRFPSolutions = [];
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				var aOldSol = oController.masterDataModel.getProperty("/OldTaxonomies");
				if (aOldSol === undefined) {
					aOldSol = [];
				}
				oData.filter(function (item, index, array) {
					if (!item.OperationStatus) {
						aOldSol.push(item.SolutionDesc);
					} else {
						activeSol.push(item);
					}
				});
				var oTempArr = activeSol.map(function (obj) {
					return obj.SolId;
				});
				defaultModel.setProperty("/to_ASol", activeSol);
				activeSol.filter(function (obj, index) {
					oController.additionalSolMap[obj.SolId] = obj;
					aCXRFPSolutions.push(obj.SolId);
				});

				if ((defaultModel.getProperty("/FormLayoutId") === "00012" || defaultModel.getProperty("/FormLayoutId") === "00026") &&
					oController.uploadComponentModel) {
					oController.byId("cxrfpSolutionsSel").setSelectedKeys(aCXRFPSolutions);
					oController.uploadComponentModel.setProperty("/Authorized", (defaultModel.getProperty("/Authorized") === "X" || oController.getView()
						.getModel("user").getProperty("/CXRFP_User") === "X"));
				}
				//oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
				oController.fnSetActDetailPanelsBusy("idActivityComments", false);

				if (defaultModel.getProperty("/FormLayoutId") === "00001" || defaultModel.getProperty("/FormLayoutId") === "00024") {
					if (aOldSol.length && oController._oApplicationProperties.getProperty("/isEditMode")) {
						if (aOldSol.length > 1) {
							sInactiveMsg = aOldSol.join(", ") + "  are inactive now.";
						} else {
							sInactiveMsg = aOldSol.join(", ") + "  is inactive now.";
						}
						oController.masterDataModel.setProperty("/OldSolMsg", sInactiveMsg);
						oController.masterDataModel.setProperty("/aOldSol", aOldSol);
						oController.byId("oldSolMsgBtn").setVisible(true);
						oController.dataChange = true;
					} else {
						oController.masterDataModel.setProperty("/aOldSol", []);
						oController.byId("oldSolMsgBtn").setVisible(false);
					}
				}
			});
		},

		getActDetailTaxonomy: function (oController, activityGUID) {
			oController.ServiceHelper.getActDetailTaxonomy(oController.oActFormODataModel, activityGUID).then(function (result) {
				var aOldSol = [];
				var sInactiveMsg = "";
				var activeTaxonomies = [];
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				oData.filter(function (item, index, array) {
					if (!item.Active) {
						var oId = item.LevelCount;
						var desc = item["L" + oId + "Desc"];
						aOldSol.push(desc);
					} else {
						activeTaxonomies.push(item);
					}
				});
				oData = activeTaxonomies;
				defaultModel.setProperty("/to_ATaxonomy", oData);
				oController.oSolutionsModel.setProperty("/to_ATaxonomy", oData);

				if (oData.length) {
					oController.masterDataModel.setProperty("/Level2Key", oData[0].L2Id);
					oData.filter(function (item) {
						var sLevelId = 'L' + item.LevelCount + 'Id';
						var sLevelDesc = 'L' + item.LevelCount + 'Desc';
						var oSol = {
							L2Id: item.L2Id,
							L3Id: item.L3Id,
							L4Id: item.L4Id,
							L5Id: item.L5Id,
							LevelCount: item.LevelCount,
							SolId: item[sLevelId],
							SolutionDesc: item[sLevelDesc]
						};
						if (item.LevelCount) {
							oSol.LevelId = item[sLevelId];
							oSol.LevelDesc = item[sLevelDesc];
						}
						item.LevelId = item[sLevelId];
						item.LevelDesc = item[sLevelDesc];
						oController.aSolTokens.push(oSol);
						var formLayoutId = defaultModel.getProperty("/FormLayoutId");
						if (formLayoutId === "00019") {
							if (!defaultModel.getProperty("/to_AMaterial").length) {
								oController.oSolutionsModel.setProperty("/SolutionId", oSol.SolId);
								oController.oSolutionsModel.setProperty("/SolutionDesc", oSol.SolutionDesc);
							}
						}
					});
					oController.selectedLevelCopy = oData;
					oController.solTokenCopy = oController.aSolTokens;
				}
			});
		},

		getActDetailMaterials: function (oController, activityGUID) {
			oController.ServiceHelper.getActDetailMaterials(oController.oActFormODataModel, activityGUID).then(function (result) {
				var oTempArr = [];
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				oController.aSolTokens = [];
				oData.filter(function (item) {
					if (item.Active === "X") {
						var oSol = {
							L2Id: item.L2Id,
							L3Id: item.L3Id,
							L4Id: item.L4Id,
							L5Id: item.L5Id,
							SolId: item.MatId,
							SolutionDesc: item.MatDesc,
							LevelId: item.MatId,
							LevelDesc: item.MatDesc
						};
						item.LevelId = item.MatId;
						item.LevelDesc = item.MatDesc;
						oController.aSolTokens.push(oSol);
						oController.oSolutionsModel.setProperty("/SolutionId", oSol.SolId);
						oController.oSolutionsModel.setProperty("/SolutionDesc", oSol.SolutionDesc);
						oTempArr.push(item);
					}
				});
				defaultModel.setProperty("/to_AMaterial", oTempArr);
				oController.oSolutionsModel.setProperty("/to_AMaterial", oTempArr);
			});
		},

		getActSuccessFactors: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActSuccessFactors(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var formLayoutId = oController.defaultModel.getProperty("/FormLayoutId");
				oData.filter(function (item) {
					if (!(item.Username.trim() || item.CompName.trim() || item.AccessKey.trim())) {
						oData = [];
					}
				});
				if (formLayoutId === "00001" || formLayoutId === "00024") {
					oController.byId("idDCRBtn").setVisible((oData && oData.length > 0) ? true : false);
					oController.byId("tblSuccessFactor").setVisible((oData && oData.length > 0) ? true : false);
				}
				var checkBoxes = oController.byId("idDCRBtn").getItems();
				var tempSuccessFactor = [];
				for (var i = 0; i < oData.length; i++) {
					var sDCId = oData[i].DCId;
					oController.dcMap[sDCId].counter++;
					checkBoxes[oController.dcMap[sDCId].index].setSelected(true);
					if (oData[i].AccessKey.trim() !== "" || oData[i].CompName.trim() !== "" ||
						oData[i].Username.trim() !== "") {
						tempSuccessFactor.push(oData[i]);
					}
				}
				oController.defaultModel.setProperty("/to_ASuccessFactor", tempSuccessFactor);
			});
		},

		getActTeamMembers: function (oController, activityGUID) {
			var that = this;
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActTeamMembers(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var formLayoutId = oController.defaultModel.getProperty("/FormLayoutId");
				oController.opportunityComponentInstance._oOpportunityHelper._filterOpportunityTeam(oData);
				if (oController.defaultModel.getProperty("/OpportunityNumber")) {
					oController.getView().getModel("opportunityModel").setProperty("/bShowOpportunityDetails", true);
				}
				oController.getView().getModel("opportunityModel").refresh(true);
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 1);
				if (formLayoutId === "00013" && oData.length === 0 && oController.createMode === "DETAIL_ACTIVITY") {
					oController.byId("PC_ACTIVITY_DETAIL_TEAM_LAYOUT_TITLE").setText("");
				} else {
					oController.byId("PC_ACTIVITY_DETAIL_TEAM_LAYOUT_TITLE").setText("Activity Team");
				}
				that.fnSelectTeamUsers(oController);
			});
		},

		//Function to set selected Team users
		fnSelectTeamUsers: function (oController) {
			var opportunityModel = oController.getView().getModel("opportunityModel");
			var oTeamUsers = [];
			if (oController.formLayoutId === "00014" || oController.formLayoutId === "00015" || oController.formLayoutId === "00016") {
				oTeamUsers = opportunityModel.getProperty("/selectedOpportunityTeam/HSC_TEAM");
			} else {
				oTeamUsers = opportunityModel.getProperty("/selectedOpportunityTeam/PRESALES_TEAM");
			}
			if (oTeamUsers.length) {
				var oCRMUserModel = oController.oCRMUserModel;
				var oCRMUsers = oCRMUserModel.getProperty("/presalesTeam");
				if (oCRMUsers.length) {
					oTeamUsers.filter(function (oppoTeamUser) {
						var oId = oppoTeamUser.ID;
						// var oEmailId = oppoTeamUser.EMAIL;
						oCRMUsers.filter(function (obj, index) {
							// if (obj.ID === oId && obj.EMAIL === oEmailId) {
							if (obj.ID === oId) {
								obj.checked = true;
								oppoTeamUser.ROLE_DESC = obj.ROLE_DESC;
								oController.byId("UserListMulti_CRM").getItems()[index].setSelected(true);
							}

						});
					});
					oCRMUserModel.refresh();
				}
				if (oController.formLayoutId === "00014" || oController.formLayoutId === "00015" || oController.formLayoutId === "00016") {
					opportunityModel.setProperty("/selectedOpportunityTeam/HSC_TEAM", oTeamUsers);
				} else {
					opportunityModel.setProperty("/selectedOpportunityTeam/PRESALES_TEAM", oTeamUsers);
				}
				opportunityModel.refresh(true);
				if (oController.formLayoutId === "00001") {
					oController.createDemoSurveyData(opportunityModel.getProperty("/selectedOpportunityTeam"));
				}
			}
		},

		getActDetAudienceData: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActDetAudienceData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oData.filter(function (obj) {
					var audienceId = obj.AudienceID;
					var audienceLayout = oController.byId("actDetAudience");
					audienceLayout.getItems().filter(function (item) {
						if (item.getName() === audienceId) {
							item.setSelected(true);
						}
					});
				});
				oController.masterDataModel.setProperty("/to_AAudience", oData);
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 1);
				oController.fnSetActDetailGridsBusy("idActivityDetails", false);
			});
		},

		getActDetPhases: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActDetPhases(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				oController.byId("phaseVbox").getBinding("items").filter(new Filter({
					path: "ActivityTypeId",
					operator: "EQ",
					value1: defaultModel.getProperty("/ActivityTypeId")
				}));
				var checkBoxes = oController.byId("phaseVbox").getItems();
				for (var i = 0; i < oData.length; i++) {
					var PId = oData[i].PhaseId;
					oController.phaseMap[PId].counter++;
					checkBoxes[oController.phaseMap[PId].index].getItems()[0].setSelected(true);
					if (defaultModel.getProperty("/FormLayoutId") === "00021" || defaultModel.getProperty("/FormLayoutId") === "00022") {

					} else {
						checkBoxes[oController.phaseMap[PId].index].getItems()[1].setVisible(true);
						checkBoxes[oController.phaseMap[PId].index].getItems()[1].getItems()[1].setDateValue(oData[i].DateComplete);
						checkBoxes[oController.phaseMap[PId].index].getItems()[2].setVisible(true);
						checkBoxes[oController.phaseMap[PId].index].getItems()[2].getItems()[1].setSelectedKey(oData[i].MethodId);
					}
				}
				defaultModel.setProperty("/to_APhase", oData);
				var phaseData = defaultModel.getProperty("/to_APhase");
				var contentKm = defaultModel.getProperty("/to_AFiles");
				if (Array.isArray(phaseData) && Array.isArray(contentKm)) {
					oController.setCompleteActionTblDataOnRead(defaultModel.getData());
				}
				//oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
			});
		},

		getActAddOpportunities: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActAddOpportunities(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oController.opptData = oData;
				oController.selectedAddOpps = oData;
				oController.storeSelectedAddOpps = oData;
				if (oData.length === 0) {
					//oController.byId("additionalOpptMultiInput").removeToken(0);
				}
				oController.defaultModel.setProperty("/to_AAddOpp", oData);
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 1);
				//oController.fnSetActDetailGridsBusy("idActivityDetails", false);
			});
		},

		getActDetBusinessAreaEng: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActDetBusinessAreaEng(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				defaultModel.setProperty("/to_ABsnsArEngd", oData);
				var oTempArr = oData.map(function (obj) {
					return obj.BsnsAreaEngdID;
				});
				oController.byId("bsAreaEngagedSel").setSelectedKeys(oTempArr);
				//oController.fnSetActDetailGridsBusy("idActivityDetails", false);
			});
		},

		getActAttachments: function (oController, activityGUID) {
			var that = this;
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActAttachments(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				//var oActivityId = defaultModel.getProperty("/ActivityTypeId");
				var formLayoutId = defaultModel.getProperty("/FormLayoutId");
				if ((formLayoutId !== "00001" && formLayoutId !== "00003" && formLayoutId !== "00005" && formLayoutId !== "00006" && formLayoutId !==
						"00012" && formLayoutId !== "00013" && formLayoutId !== "00014" && formLayoutId !== "00015" && formLayoutId !== "00016" &&
						formLayoutId !== "00020" && formLayoutId !== "00026") && oData.length > 0) {
					if (oController.oStorage.get("isCopied") === "X") {
						oController.byId("idContentKM").setSelected(false);
						//oController._oApplicationProperties.setProperty("/ContentInKM", "");
						var newLink = {
							"DocumentType": "0001",
							"Status": "X",
							"Url": "",
							"ProjectType": "ACTVT",
							"FileId": ""
						};
						oData = [];
						oData.push(newLink);
					} else {
						oController.byId("idContentKM").setSelected(true);
						oController._oApplicationProperties.setProperty("/ContentInKM", "X");
						oData[oData.length - 1].Status = "X";
					}
				} else {
					if (formLayoutId !== "00001" && formLayoutId !== "00003" && formLayoutId !== "00005" && formLayoutId !== "00006" && formLayoutId !==
						"00012" && formLayoutId !== "00013" && formLayoutId !== "00014" && formLayoutId !== "00015" && formLayoutId !== "00016" &&
						formLayoutId !== "00020" && formLayoutId !== "00026") {
						var newLink = {
							"DocumentType": "0001",
							"Status": "X",
							"Url": "",
							"ProjectType": "ACTVT",
							"FileId": ""
						};
						oData.push(newLink);
					}
				}
				defaultModel.setProperty("/to_AFiles", oData);
				if (formLayoutId === "00012") {
					oController.uploadComponentModel.setProperty("/yfileSet", oData);
					oController.fnSetActDetailPanelsBusy("idActivityDeliverables", false);
				} else if (formLayoutId === "00013") {
					oController.fnSetActDetailPanelsBusy("idActivityDeliverables", false);
				} else if (formLayoutId === "00020") {
					var phaseData = defaultModel.getProperty("/to_APhase");
					var contentKm = defaultModel.getProperty("/to_AFiles");
					if (Array.isArray(phaseData) && Array.isArray(contentKm)) {
						oController.setCompleteActionTblDataOnRead(defaultModel.getData());
					}
				}
				//Change below code
				if (oController.oStorage.get("isCopied") === "X") {
					if (formLayoutId === "00018" || formLayoutId === "00019" || formLayoutId === "00020" || formLayoutId === "00021" || formLayoutId ===
						"00022") {

					} else {
						defaultModel.setProperty("/to_AFiles", oData);
						oController._oApplicationProperties.setProperty("/ContentInKM", "");
					}
					oController.uploadComponentModel.setProperty("/yfileSet", []);
					return;
				}
			});
		},

		getActComments: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getActComments(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				var defaultModel = oController.defaultModel;
				defaultModel.setProperty("/to_AComments", oData);
				if (oController.oStorage.get("isCopied") === "X") {
					defaultModel.setProperty("/to_AComments", []);
				}
				var formLayoutId = defaultModel.getProperty("/FormLayoutId");
				if (formLayoutId === "00013" || formLayoutId === "00017" || formLayoutId === "00018") {
					oController.fnSetActDetailPanelsBusy("idActivityComments", false);
				}
			});
		},

		getActTeamMemberDetails: function (oController, userId) {
			var aFilter = [new Filter("ID", "EQ", userId)];
			oController.ServiceHelper.getActTeamMemberDetails(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oController.userDetail.setProperty("/", oData[0]);
			});
		},

		//Function to get Activity Type, Account/Opportunity based on SL GUID
		getSlActivityType: function (oController, slGuid, isReadActivity) {
			var that = this;
			var successlineModel = oController.successlineModel;
			oController.ServiceHelper.getSLAccOppFlds(successlineModel, slGuid).then(function (result) {
				var oData = result.data;
				/*var oAccessRoleId = oController.oRegModel.getProperty("/RoleMpngID");
				if (oController.masterDataModel.getProperty("/RoleID") !== oAccessRoleId && oController.createMode === "NEW_ACTIVITY") {
					that.fnSetUserUnAuthorized(oController);
				}*/
				var sRoleId = oController.masterDataModel.getProperty("/RoleID");
				oData.RoleMpngID = sRoleId ? sRoleId : oData.RoleMpngID;
				oController.formLayoutId = oData.FormLayoutID;
				oController.masterDataModel.setProperty("/FormLayoutID", oController.formLayoutId);
				if (oData.ActLeadId) {
					var oActLead = {
						"ROLE": "ZOPRSL01",
						"NAME": oData.ActLead,
						"ID": oData.ActLeadId,
						"EMAIL": oData.ActLeadEmail
					};
					oController.getView().getModel("opportunityModel").setProperty("/selectedOpportunityTeam/PRESALES_LEAD", oActLead);
				}
				if (oData.RegisteredActId && oData.StatusId !== "2" && !isReadActivity) {
					oController.getOwnerComponent().getRouter().getTargets().display("requestNotFound");
				} else {
					var masterDataModel = oController.masterDataModel;
					masterDataModel.setProperty("/slDetails", oData);
					var ActivityTypeId = oController.defaultModel.getProperty("/ActivityTypeId");
					var formLayoutId = oController.defaultModel.getProperty("/FormLayoutId");
					if (oData.OpportunityID) {
						oController._oApplicationProperties.setProperty("/opptId", oData.OpportunityID);
						oController.getView().getModel("opportunityModel").setProperty("/selectedOpportunity/OPPT_ID", oData.OpportunityID);
						oController._oApplicationProperties.setProperty("/isTeamUpdate", false);
						if (oController.opportunityComponentInstance.getMetadata()) {
							oController.getOpportunityData();
						} else {
							oController.opportunityComponentInstance.getModel("oppServerModel").attachMetadataLoaded(oController.getOpportunityData,
								oController);
						}
						oController.oRegModel.setProperty("/associateType", 1);
						oController._oApplicationProperties.setProperty("/isTeamUpdate", true);
					} else if (oData.AccountID) {
						oController.oRegModel.setProperty("/associateType", 0);
						if (formLayoutId === "00013") {
							oController.byId("accntInfo").setVisible(true);
							oController.getView().getModel("cvaModel").setProperty("/selectedOpportunity/accountid", oData.AccountID);
							oController.getView().getModel("opportunityModel").setProperty("/selectedOpportunity/OPPT_ID", oData.AccountID);
							oController.opportunityComponentInstance._oOpportunityHelper.getAccountDetails(oData.AccountID, false);
						} else {
							oController.opportunityComponentInstance._oOpportunityHelper.getAccountDetails(oData.AccountID, true);
						}
						var opportunityModel = oController.getView().getModel("opportunityModel");
						opportunityModel.setProperty("/bShowOpportunityDetails", true);
						oController.getView().getModel("cvaModel").setProperty("/isCvaSelected", true);
						oController._oApplicationProperties.setProperty("/oppInfoIconVisibile", true);
					}
					oController.defaultModel.setProperty("/RoleMpngID", oData.RoleMpngID);
					oController.oRegModel.setProperty("/RoleMpngID", oData.RoleMpngID);
					oController.masterDataModel.setProperty("/ActivityTypeInfo", oData.ActivityTypeInfo);
					that.getActivityTypeDesc(oController, ActivityTypeId);
					oController.handleActivitySelect();
					that.disableSLFields(oController);
					oController.defaultModel.setProperty("/SLActGUID", oData.SLActGUID);
				}
			});
		},

		disableSLFields: function (oController) {
			var oRegModel = oController.oRegModel;
			oController.byId("actTypeSel").setEditable(false);
			oController.byId("cvaAccount").setEditable(false);
			oController.byId("CANCEL_OPPORTUNITY").setVisible(false);
			oRegModel.setProperty("/registrationTypes/0/isEnabled", false);
			oRegModel.setProperty("/registrationTypes/1/isEnabled", false);
			oRegModel.setProperty("/registrationTypes/2/isEnabled", false);
			sap.ui.getCore().byFieldGroupId("pcOpportunityInput")[0].setEditable(false);
			oController.getView().getModel("opportunityModel").setProperty("/opptEnabled", false);
			oController.getView().getModel("opportunityModel").refresh();
		},

		//Function to disable UI Datepicker
		fnDisableDatePicker: function (datePickers) {
			datePickers.filter(function (oDatePicker) {
				oDatePicker.addDelegate({
					onAfterRendering: function () {
						oDatePicker.$().find("INPUT").attr("disabled", true);
					}
				}, oDatePicker);
			});
		},

		//Function to set contentInKM +/- buttons visisble
		fnSetContentKMAddRemoveBtns: function (oController, btnActionType) {
			var oContentKMLayout = oController.byId("contentKmVbox");
			var oContentKMLayItems = oContentKMLayout.getItems();
			if (oContentKMLayItems.length === 1) {
				oContentKMLayItems[0].getItems()[1].getItems()[2].setVisible(false);
				oContentKMLayItems[0].getItems()[1].getItems()[3].setVisible(true);
			} else if (oContentKMLayItems.length > 1) {
				oContentKMLayItems.filter(function (item, index) {
					if (index === oContentKMLayItems.length - 1) {
						oContentKMLayItems[index].getItems()[1].getItems()[2].setVisible(true);
						oContentKMLayItems[index].getItems()[1].getItems()[3].setVisible(true);
					} else {
						oContentKMLayItems[index].getItems()[1].getItems()[2].setVisible(true);
						oContentKMLayItems[index].getItems()[1].getItems()[3].setVisible(false);
					}
				});
			}
		},

		fnSetUserUnAuthorized: function (oController) {
			sap.m.MessageBox.error("User unauthorized to create Activity", {
				onClose: function () {
					var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
					if (oCrossAppNavigator) {
						oCrossAppNavigator.backToPreviousApp();
					}
				}
			});
		},

		getFilteredActLeadData: function (oController, aOppTeamKeys, sQuery, isOppTeam) {
			var aFilters = [];
			var aMultiFilter = [];
			oController._oApplicationProperties.setProperty("/isActLeadListBusy", true);
			var sRolempngId = oController.oRegModel.getProperty("/RoleMpngID");
			if (oController.serviceRequest) {
				sRolempngId = "";
			} else {
				if ((oController.createMode === "EDIT_ACTIVITY" || oController.createMode === "DETAIL_ACTIVITY") && !sRolempngId) {
					sRolempngId = oController.defaultModel.getProperty("/RoleMpngID");
				}
			}
			aFilters.push(new Filter("RolempngId", "EQ", sRolempngId));
			if (aOppTeamKeys) {
				aOppTeamKeys.filter(function (userId) {
					aMultiFilter.push(new Filter("UserId", "EQ", userId));
				});
				if (aMultiFilter.length > 0) {
					aFilters.push(new Filter({
						filters: aMultiFilter,
						and: false
					}));
				}
			}
			oController.ServiceHelper.getActLeadData(oController.oActFormODataModel, aFilters, sQuery).then(function (result) {
				var oData = result.data.results;
				if (isOppTeam) {
					oController.oUserModel.setProperty("/presalesTeam", oData);
				} else {
					oController.oUserModel.setProperty("/OreActLeadUsers", oData);
				}
				oController.isOppTeamChanged = false;
				oController._oApplicationProperties.setProperty("/isActLeadListBusy", false);
			});
		},

		getLevel2MasterData: function (oController) {
			oController.ServiceHelper.getLevel2MasterData(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/Level2Data", result.data.results);
				if (result.data.results.length && !oController._oApplicationProperties.getProperty("/isEditMode")) {
					oController.masterDataModel.setProperty("/Level2Key", result.data.results[0].L2Id);
				}
			});
		},

		getSolutionHierarchy: function (oController) {
			var that = this;
			var oMaterialMap = {};
			oController.ServiceHelper.getSolutionHierarchy(oController.oActFormODataModel).then(function (result) {
				var oData = result.data.results;
				var aMaterialData = oData.map(function (obj, index) {
					obj.isSelected = false;
					oMaterialMap[obj["MatId"]] = index;
					return obj;
				});
				oController.oSolutionsModel.setProperty("/SolutionHierarchy", aMaterialData);
				oController.oSolutionsModel.setProperty("/MaterialMap", oMaterialMap);
				var sSelectedLevel = oController.masterDataModel.getProperty("/Level2Key");
				that._convertToTree(oController, aMaterialData, sSelectedLevel, false);
				oController.fnSetSelectedSolutions();
				oController.fnSetActDetailGridsBusy("idActivityDetails", false, 0);
			});
		},

		_convertToTree: function (oController, aMaterialData, sSelectedLevel, isOpp) {
			var L4Map = {},
				L5Map = {};
			var aLevelsTree = [];
			for (var i = 0; i < aMaterialData.length; i++) {
				var level2Index = aLevelsTree.findIndex(function (item) {
					return item.LevelId === aMaterialData[i]["L2Id"];
				});
				if (aMaterialData[i]["L2Id"]) {
					if (level2Index === -1) {
						aLevelsTree.push({
							LevelId: aMaterialData[i]["L2Id"],
							LevelDesc: aMaterialData[i]["L2Desc"],
							L2Id: aMaterialData[i]["L2Id"],
							L2Desc: aMaterialData[i]["L2Desc"],
							L3Id: aMaterialData[i]["L3Id"],
							L3Desc: aMaterialData[i]["L3Desc"],
							L4Id: aMaterialData[i]["L4Id"],
							L4Desc: aMaterialData[i]["L4Desc"],
							L5Id: aMaterialData[i]["L5Id"],
							L5Desc: aMaterialData[i]["L5Desc"],
							MatId: aMaterialData[i]["MatId"],
							LevelCount: 2,
							isVisible: false,
							isSelected: false,
							Levels: []
						});
						level2Index = aLevelsTree.length - 1;
					}
					var aLevel3 = aLevelsTree[level2Index].Levels;
				}
				var level3Index = aLevel3.findIndex(function (item) {
					return item.LevelId === aMaterialData[i]["L3Id"];
				});
				if (aMaterialData[i]["L3Id"]) {
					if (level3Index === -1) {
						aLevel3.push({
							LevelId: aMaterialData[i]["L3Id"],
							LevelDesc: aMaterialData[i]["L3Desc"],
							L2Id: aMaterialData[i]["L2Id"],
							L2Desc: aMaterialData[i]["L2Desc"],
							L3Id: aMaterialData[i]["L3Id"],
							L3Desc: aMaterialData[i]["L3Desc"],
							L4Id: aMaterialData[i]["L4Id"],
							L4Desc: aMaterialData[i]["L4Desc"],
							L5Id: aMaterialData[i]["L5Id"],
							L5Desc: aMaterialData[i]["L5Desc"],
							MatId: aMaterialData[i]["MatId"],
							LevelCount: 3,
							isVisible: false,
							isSelected: false,
							Levels: []
						});
						level3Index = aLevel3.length - 1;
					}
					var aLevel4 = aLevel3[level3Index].Levels;
				}
				var level4Index = aLevel4.findIndex(function (item) {
					return item.LevelId === aMaterialData[i]["L4Id"];
				});
				if (aMaterialData[i]["L4Id"]) {
					if (level4Index === -1) {
						aLevel4.push({
							LevelId: aMaterialData[i]["L4Id"],
							LevelDesc: aMaterialData[i]["L4Desc"],
							L2Id: aMaterialData[i]["L2Id"],
							L2Desc: aMaterialData[i]["L2Desc"],
							L3Id: aMaterialData[i]["L3Id"],
							L3Desc: aMaterialData[i]["L3Desc"],
							L4Id: aMaterialData[i]["L4Id"],
							L4Desc: aMaterialData[i]["L4Desc"],
							L5Id: aMaterialData[i]["L5Id"],
							L5Desc: aMaterialData[i]["L5Desc"],
							MatId: aMaterialData[i]["MatId"],
							LevelCount: 4,
							isVisible: true,
							isSelected: false,
							isOpportunity: false,
							ValueState: "None",
							Levels: []
						});
						level4Index = aLevel4.length - 1;
					}
					var aLevel5 = aLevel4[level4Index].Levels;
				}
				var level5Index = aLevel5.findIndex(function (item) {
					return item.LevelId === aMaterialData[i]["L5Id"];
				});
				if (aMaterialData[i]["L5Id"]) {
					if (level5Index === -1) {
						var obj = {
							LevelId: aMaterialData[i]["L5Id"],
							LevelDesc: aMaterialData[i]["L5Desc"],
							L2Id: aMaterialData[i]["L2Id"],
							L2Desc: aMaterialData[i]["L2Desc"],
							L3Id: aMaterialData[i]["L3Id"],
							L3Desc: aMaterialData[i]["L3Desc"],
							L4Id: aMaterialData[i]["L4Id"],
							L4Desc: aMaterialData[i]["L4Desc"],
							L5Id: aMaterialData[i]["L5Id"],
							L5Desc: aMaterialData[i]["L5Desc"],
							MatId: aMaterialData[i]["MatId"],
							LevelCount: 5,
							isVisible: true,
							isSelected: false,
							isOpportunity: false,
							ValueState: "None",
							Levels: [],
							RadioBtnGrpName: aMaterialData[i]["L5Id"]
						};
						aLevel5.push(obj);
						level5Index = aLevel5.length - 1;
						L5Map[aMaterialData[i]["L5Id"]] = aLevel4[level4Index];
						L4Map[aMaterialData[i]["L4Id"]] = aLevel5;
					}
				}
			}
			oController.oSolutionsModel.setProperty("/LevelsHierarchy", aLevelsTree);
			oController.L2Map = {};
			aLevelsTree.filter(function (l2) {
				oController.L2Map[l2.L2Id] = l2;
			});
			if (isOpp) {
				oController.oSolutionsModel.setProperty("/OppLevelsHierarchy", aLevelsTree);
			} else {
				var oLevelData = this.fnJoinAllLevelsData(aLevelsTree);
				oController.oSolutionsModel.setProperty("/SelectedLevelHierarchy", oLevelData);
			}
			oController.oSolutionsModel.setProperty("/L4Map", L4Map);
			oController.oSolutionsModel.setProperty("/L5Map", L5Map);

			//Below lines of code is to form oppo materials array, so it can be selected in popup
			var isActCopied = oController.masterDataModel.getProperty("/isCopied");
			if (oController.createMode === "DETAIL_ACTIVITY" || oController.createMode === "EDIT_ACTIVITY" || isActCopied) {
				var to_ATaxonomy = oController.oSolutionsModel.getProperty("/to_ATaxonomy");
				to_ATaxonomy = oController.fnGetL4sChildobject(to_ATaxonomy, L4Map);
				to_ATaxonomy = oController.fnGetL5sParentobject(to_ATaxonomy);
				oController.oSolutionsModel.setProperty("/to_ATaxonomy", to_ATaxonomy);
				var to_AMaterial = oController.oSolutionsModel.getProperty("/to_AMaterial");
				oController.oSolutionsModel.setProperty("/oSolTempArr", $.extend(true, [], to_ATaxonomy));
				oController.oSolutionsModel.setProperty("/oMatTempArr", $.extend(true, [], to_AMaterial));
				var SolTokens = to_ATaxonomy.concat(to_AMaterial);
				var displayTokens = oController.fnGetDisplayTokens(SolTokens);
				oController.oSolutionsModel.setProperty("/DisplayTokens", displayTokens);
				var OpportunityMaterials = oController.oSolutionsModel.getProperty("/OpportunityMaterials");
				if (OpportunityMaterials) {
					oController.fnFormOpportunityMaterials(OpportunityMaterials);
					oController.fnFormOppoSolTempArr(to_ATaxonomy, OpportunityMaterials);
				}
				oController.oSolutionsModel.setProperty("/SolTokens", displayTokens);
				if (oController.formLayoutId === "00001" || oController.formLayoutId === "00024") {
					oController._setTopDealAccess(to_ATaxonomy, true);
				}
			}
		},

		fnJoinAllLevelsData: function (aLevelsTree) {
			var oLevelData = [];
			var oKeys = Object.keys(aLevelsTree);
			for (var i = 0; i < oKeys.length; i++) {
				var cLevels = aLevelsTree[oKeys[i]].Levels;
				oLevelData = oLevelData.concat(cLevels);
			}
			return oLevelData;
		},

		getOpptProfitCenterData: function (oController, aFilter) {
			ServiceHelper.getOpptProfitCenterData(oController.oActFormODataModel, aFilter).then(function (result) {
				var data = result.data.results[0];
				if (oController.defaultModel) {
					oController.defaultModel.setProperty("/Region", data.Region);
					oController.defaultModel.setProperty("/SubRegion", data.SubRegion);
				}
				oController.getView().getModel("visibilityModel").setProperty("/0/region", true);
				oController.dataChange = true;
			});
		},

		getDuplicateRegistrations: function (oController, aFilter) {
			ServiceHelper.getDuplicateRegistrations(oController.oActFormODataModel, aFilter).then(function (result) {
				var data = result.data.results;
				if (data.length > 0) {
					if (!oController.duplicateDemoDialog) {
						oController.duplicateDemoDialog = sap.ui.xmlfragment(oController.getView().getId(),
							"com.presalescentral.activityform.view.ActivityFormFragments.duplicateDemoShow",
							oController);
						oController.getView().addDependent(oController.duplicateDemoDialog);
					}
					oController.duplicateDemoDialog.open();
					if (!oController.demoJustificationDialog) {
						oController.demoJustificationDialog = sap.ui.xmlfragment(oController.getView().getId(),
							"com.presalescentral.activityform.view.ActivityFormFragments.demoJustification",
							oController);
						oController.getView().addDependent(oController.demoJustificationDialog);
					}
				}
				oController._oView.getModel("opportunityModel").setProperty("/duplicateRegistrationData", data);
			});
		},

		getShowroomData: function (oController) {
			var toDate = oController.formatDate(oController.defaultModel.getProperty("/EndDate"));
			var fromDate = oController.formatDate(oController.defaultModel.getProperty("/StartDate"));
			var aFilter = new Filter({
				filters: [
					new Filter({
						path: "AvailableFrom",
						operator: "LE",
						value1: fromDate
					}),
					new Filter({
						path: "AvailableTo",
						operator: "GT",
						value1: toDate
					})
				],
				and: true
			});
			ServiceHelper.getMasterData(oController.oActFormODataModel, [aFilter], "/Yc_Mac_M_Showroom").then(function (result) {
				var data = result.data.results;
				for (var i in data) {
					if (oController.showroomMap.hasOwnProperty(data[i].OrderNumber) && data[i].SelectionCat === "M") {
						data[i].selected = true;
					} else {
						data[i].selected = false;
					}
				}
				oController.getView().getModel("masterDataModel").setData({
					"showroom": data
				}, true);
				oController.byId("idShowRoomTable").setBusy(false);
				oController.getView().getModel("locationModel").setData(oController.aShowroomLocation);
			});
		},

		getSapDemoEcData: function (oController) {
			var that = this;
			var oLTypeMap = {};
			ServiceHelper.getMasterData(oController.oActFormODataModel, [], "/Yc_Mac_M_LS_DemoEC").then(function (result) {
				var data = result.data.results;
				for (var i in data) {
					if (!oLTypeMap.hasOwnProperty(data[i].Ltype) && data[i].LTypeDescription !== "") {
						oLTypeMap[data[i].Ltype] = data[i].LTypeDescription;
					}
					if (oController.landscapeMap.hasOwnProperty(data[i].LandsId) && data[i].SelectionCat === "Master") {
						data[i].selected = true;
						data[i].prevSelected = true;
					} else {
						data[i].selected = false;
						data[i].prevSelected = false;
					}
				}
				oController.masterDataModel.setProperty("/LTypeMap", oLTypeMap);
				data = that.fnFormatFlatToTreeData(data, "SelectionCat");
				data = that.fnRestructureTreeData(data, "SelectionCat", "sapDemoEc");
				oController.masterDataModel.setProperty("/sapDemoEc", data);
				if (oController.byId("idSapDemoEcTable")) {
					oController.byId("idSapDemoEcTable").setBusy(false);
				}
				oController.fnDemoEnvExpandCollapseAll("", "sapDemoEc", "sapDemoEcSearchField", true);
				oController.fnSetSAPDemoECSelectAll("sapDemoEc", "isSapDemoEcSelectAll");
			});
		},

		getDemoLandScapes: function (oController) {
			var oLTypeMap = {};
			var that = this;
			ServiceHelper.getMasterData(oController.oActFormODataModel, [], "/Yc_Mac_M_Landscape").then(function (result) {
				var data = result.data.results;
				for (var i in data) {
					if (!oLTypeMap.hasOwnProperty(data[i].Ltype) && data[i].LTypeDescription !== "") {
						oLTypeMap[data[i].Ltype] = data[i].LTypeDescription;
					}
					if (oController.landscapeMap.hasOwnProperty(data[i].LandsId) && data[i].SelectionCat === "Master") {
						data[i].selected = true;
						data[i].prevSelected = true;
					} else {
						data[i].selected = false;
						data[i].prevSelected = false;
					}
				}
				data = that.fnFormatFlatToTreeData(data, "SelectionCat");
				data = that.fnRestructureTreeData(data, "SelectionCat", "landscape");
				oController.masterDataModel.setProperty("/LTypeMap", oLTypeMap);
				oController.masterDataModel.setProperty("/landscape", data);
				if (oController.byId("idLandscapeTable")) {
					oController.byId("idLandscapeTable").setBusy(false);
				}
				oController.fnDemoEnvExpandCollapseAll("", "landscape", "landscapeSearchField", true);
				oController.fnSetSAPDemoECSelectAll("landscape", "isLandscapeSelectAll");
			});
		},

		//Function to format flat to tree structure data
		fnFormatFlatToTreeData: function (oData, property) {
			return oData.reduce(function (acc, obj) {
				var key = obj[property];
				if (!acc[key]) {
					acc[key] = [];
				}
				// Add object to list for given key's value
				acc[key].push(obj);
				return acc;
			}, {});
		},

		//Function to group data in tree structure
		fnRestructureTreeData: function (oData, oFieldProperty, oArrayProperty) {
			var oTempArr = [];
			var oKeys = Object.keys(oData);
			for (var i = 0; i < oKeys.length; i++) {
				var oTempObj = {};
				oTempObj["isParent"] = true;
				oTempObj["isExpanded"] = true;
				oTempObj[oFieldProperty] = oKeys[i];
				oTempObj[oArrayProperty] = oData[oKeys[i]];
				oTempArr.push(oTempObj);
			}
			return oTempArr;
		},

		getActionTblPhaseData: function (oController, oReadData) {
			var that = this;
			var aFilter = [];
			if (oController.activityTypeId) {
				aFilter = [new Filter("ActivityTypeId", "EQ", oController.activityTypeId)];
			} else {
				aFilter = [new Filter("ActivityTypeId", "EQ", oController.defaultModel.getProperty("/ActivityTypeId"))];
			}
			ServiceHelper.getMasterData(oController.oActFormODataModel, aFilter, "/YC_MAC_M_PHASE").then(function (result) {
				var data = result.data.results;
				oController.oActionTblModel.setProperty("/phases", data);
				that.getActionTblMethodData(oController);
				if (oController.oStorage.get("isCopied") === "X") {
					oController.fnMergePhaseDataSet(data, "READ");
					oController.fnReadMergeActionCompleteTbl(oReadData, data);
					oController.oStorage.put("isCopied", "");
					return;
				}
				if (oReadData) {
					oController.fnMergePhaseDataSet(data, "READ");
					oController.fnReadMergeActionCompleteTbl(oReadData, data);
				} else {
					oController.fnMergePhaseDataSet(data, "CREATE");
				}
			});
		},

		fnCancelActivity: function (oController, oPayload) {
			var that = oController;
			that._oApplicationProperties.setProperty("/isDirty", true);
			that._oApplicationProperties.setProperty("/isBusyCreating", true);
			that._oApplicationProperties.setProperty("/isDirty", true);
			ServiceHelper.fnPerformActivityActions(oController.oActFormODataModel, oPayload).then(function (result) {
				that._oApplicationProperties.setProperty("/isAppBusy", false);
				MessageToast.show(that._oResourceBundle.getText("xmsg.cancelActivitySeccessPopup"));
				if (that.serviceRequest) {
					MessageToast.show(that._oResourceBundle.getText("xmsg.cancelRequestPopup"));
				}
				that.defaultModel.setProperty("/Status", "02");
				ActivityUtil.getUserActivities(true).then(function () {
					try {
						var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService(
							"CrossApplicationNavigation");
						oCrossAppNavigator.backToPreviousApp();
					} catch (error) {
						jQuery.sap.log.info(error);
					}
				});
			});
		},

		fnReopenActivity: function (oController, oPayload) {
			var that = oController;
			ServiceHelper.fnPerformActivityActions(oController.oActFormODataModel, oPayload).then(function (result) {
				that._oApplicationProperties.setProperty("/isAppBusy", false);
				that.defaultModel.setProperty("/Status", "01");
				if (that.serviceRequest) {
					MessageToast.show("Service Request re-opened");
				} else {
					MessageToast.show("Activity is re-opened");
				}
				ActivityUtil.getUserActivities(true).then(function () {
					try {
						var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService(
							"CrossApplicationNavigation");
						oCrossAppNavigator.backToPreviousApp();
					} catch (error) {
						jQuery.sap.log.info(error);
					}
				});
			});
		},

		fnPostCommentToUtilityServ: function (oController, UtilityModel, oPayload, oSelectedObj) {
			var that = this;
			ServiceHelper.fnPostCommentToUtilityServ(UtilityModel, oPayload).then(function (result) {
				var oData = result.data;
				if (oSelectedObj) {
					oData.editActions = oSelectedObj.oActions;
					oController.defaultModel.setProperty(oSelectedObj.sPath, oData);
					oController.updateCommentPopover.close();
					MessageToast.show(oController._oResourceBundle.getText("commentUpdated"));
				} else {
					that.fnPostCommentToActService(oController, oData);
				}
			});
		},

		fnPostCommentToActService: function (oController, oUtilData) {
			var defaultModel = oController.defaultModel;
			var ActivityGuid = defaultModel.getProperty("/ActivityGuid");
			var oPayload = {
				"ActivityGuid": ActivityGuid,
				"CommentGuid": oUtilData.CommentGuid
			};
			ServiceHelper.fnPostCommentToActService(oController.oActFormODataModel, oPayload).then(function (result) {
				oUtilData.editActions = [{
					"text": "Edit",
					"icon": "sap-icon://edit"
				}, {
					"text": "Delete",
					"icon": "sap-icon://delete"
				}];
				if (!Array.isArray(defaultModel.getData().to_AComments)) {
					defaultModel.getData().to_AComments = [];
				}
				defaultModel.getData().to_AComments.push(oUtilData);
				defaultModel.refresh();
				if (!oController.demoJustificationDialog) {
					oController.demoJustificationDialog = sap.ui.xmlfragment(oController.getView().getId(),
						"com.presalescentral.activityform.view.ActivityFormFragments.demoJustification",
						oController);
					oController.getView().addDependent(oController.demoJustificationDialog);
				}
				oController.demoJustificationDialog.close();
				MessageToast.show(oController._oResourceBundle.getText("commentPosted"));
				oController._oApplicationProperties.setProperty("/isJustDialogBusy", false);
				oController.duplicateRegSelected = true;
			});
		},

		fnDeleteUserComment: function (oController, UtilityModel, oPayload) {
			var that = oController;
			ServiceHelper.fnDeleteUserComment(UtilityModel, oPayload.getObject()).then(function (result) {
				that.dataChange = true;
				var sPath = oPayload.getPath();
				var index = sPath.split("/")[sPath.split("/").length - 1];
				var aCommentsDataPath = sPath.split("/");
				aCommentsDataPath.pop();
				var aCommentsData = that.defaultModel.getProperty(aCommentsDataPath.join("/"));
				aCommentsData.splice(index, 1);
				that.defaultModel.setProperty(aCommentsDataPath.join("/"), aCommentsData);
				that.byId("idCommentList").removeItem();
				MessageToast.show(that._oResourceBundle.getText("commentDeleted"));
			});
		},

		fnAddUsertoOppTeam: function (oController, oPayload) {
			var that = oController;
			ServiceHelper.fnAddUsertoOppTeam(oController.oActFormODataModel, oPayload).then(function (result) {
				that._oApplicationProperties.setProperty("/isDialogBusy", false);
				that.duplicateRegSelected = true;
				that.duplicateDemoDialog.close();
				if (!that.userAdditionDialog) {
					that.userAdditionDialog = sap.ui.xmlfragment(that.getView().getId(),
						"com.presalescentral.activityform.view.ActivityFormFragments.userAdditionMessage",
						that);
					that.getView().addDependent(that.userAdditionDialog);
				}
				that.userAdditionDialog.open();
			});
		},

		getActionTblMethodData: function (oController) {
			var that = oController;
			var aFilter = [new Filter("acttypeid", "EQ", that.defaultModel.getProperty("/ActivityTypeId"))];
			ServiceHelper.getMethodData(oController.oActFormODataModel, aFilter).then(function (result) {
				var data = result.data.results;
				that.getView().getModel("phaseModel").setProperty("/method", data);
			});
		},

		fnCreateActivitySet: function (oController, payload) {
			var that = this;
			oController._oApplicationProperties.setProperty("/isDirty", true);
			oController._oApplicationProperties.setProperty("/isBusyCreating", true);
			ServiceHelper.fnCreateActivitySet(oController.oActFormODataModel, payload).then(function (result) {
				var data = result.data;
				oController.defaultModel.setProperty("/ActivitySetId", data.ActSetId);
				that.getActivitySets(oController, true);
				oController._oApplicationProperties.setProperty("/isDirty", false);
				oController._oApplicationProperties.setProperty("/isAppBusy", false);
				oController.RegionMuChange = false;
				sap.ui.core.BusyIndicator.hide();
			});
		},

		fnArchiveActivity: function (oController, oPayload) {
			var that = oController;
			ServiceHelper.fnPerformActivityActions(oController.oActFormODataModel, oPayload).then(function (result) {
				if (that.archiveStatus === true) {
					MessageToast.show("Activity successfully Archived");
					that.defaultModel.setProperty("/Archived", true);
				} else if (that.archiveStatus === false) {
					MessageToast.show("Activity successfully Un-Archived");
					that.defaultModel.setProperty("/Archived", false);
				}
				that._oApplicationProperties.setProperty("/isAppBusy", false);
				that.defaultModel.refresh(true);
				ActivityUtil.getUserActivities(true).then(function () {
					that.oMTRModel.setProperty("/MtrActivity/ActivitySetStatus", (that.archiveStatus) ? "X" : "");
					that.oMTRModel.refresh(true);
				});
			});
		},

		fnSetActivityStatus: function (oController, oPayload) {
			var that = oController;
			ServiceHelper.fnPerformActivityActions(oController.oActFormODataModel, oPayload).then(function (result) {
				that._oApplicationProperties.setProperty("/isAppBusy", false);
				if (that.data.Status === "12") {
					MessageToast.show("Activity marked as completed");
				} else if (that.data.Status === "14") {
					MessageToast.show("Activity marked as customer validated");
				} else {
					MessageToast.show("Activity marked as registered");
				}
				that.defaultModel.setProperty("/Status", that.data.Status);
				that.defaultModel.refresh(true);
			});
		},

		//function to get restrict date and Days restriction
		getActivityDays: function (oController) {
			ServiceHelper.getUserActivityDays(oController.oActFormODataModel, "/YC_MAC_M_USR_ACTDAYS_CHK").then(function (result) {
				var data = result.data.results;
				oController.masterDataModel.setProperty("/activityDaysData", data);
				oController.fnHandleDaysDateRestriction(data);
			});
		},
		getRegionMu: function (oController) {
			oController.ServiceHelper.getRegionMu(oController.oActFormODataModel).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MOP_REGION_MASTER", result.data.results);
				oController.RegionMap = {};
				var aRegion = [];
				var data = result.data.results;
				var isEditMode = oController._oApplicationProperties.getProperty("/isEditMode");
				data.filter(function (item) {
					oController.RegionMap[item.Region] = item;
					if (item.IsDefault === "X") {
						aRegion.push(item);
						if (!isEditMode) {
							oController.oRegModel.setProperty("/Region", item.Region);
							oController.oRegModel.setProperty("/MU", item.SubRegion);
							oController.oRegModel.setProperty("/ProfitCenter", item.ProfitCenter);
							oController.handleRegionChange(undefined, item.Region);
						}
						// return;
					}
				});
				// var sDefaultRegion = oController.oRegModel.getProperty("/Region");
				var sDefaultRegion = aRegion.length ? aRegion[0].Region : "";
				$.each(oController.RegionMap, function (index, item) {
					if (item.Region !== sDefaultRegion) {
						aRegion.push(item);
					}
				});
				oController.masterDataModel.setProperty("/FilteredRegions", aRegion);
			});
		},

		getServiceRequestedData: function (oController) {
			var aFilter = [new Filter("Acttypeid", "EQ", oController.activityTypeId)];
			oController.ServiceHelper.getServiceRequestedData(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_SRV_REQUESTED", result.data.results);
			});
		},

		getRouteToMarket: function (oController) {
			var aFilter = [new Filter("acttypeid", "EQ", oController.activityTypeId)];
			oController.ServiceHelper.getRouteToMarket(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_ROUTE_MARKET", result.data.results);
			});
		},

		getCxDesignRegionMu: function (oController) {
			var aFilter = [new Filter("ActvtTypeId", "EQ", oController.activityTypeId)];
			oController.ServiceHelper.getCxDesignRegionMu(oController.oActFormODataModel, aFilter).then(function (result) {
				oController.masterDataModel.setProperty("/YC_MAC_M_ACT_REGION_MU", result.data.results);
				var oData = result.data.results;
				oData.filter(function (obj) {
					obj.RegMuID = obj.RegionId + "-" + obj.MuId;
				});
				oController.masterDataModel.setProperty("/YC_MAC_M_ACT_REGION_MU", oData);
			});
		},

		getCxDesignRegionMuData: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getCxDesignRegionMuData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oData.filter(function (obj) {
					obj.RegMuID = obj.RegionId + "-" + obj.MuId;
				});
				oController.defaultModel.setProperty("/to_ARegionMu", oData);
				var oTempArr = oData.map(function (obj) {
					return obj.RegMuID;
				});
				oController.byId("cxDesignRegionMU").setSelectedKeys(oTempArr);
			});
		},

		getCxDesignRouteToMarketData: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getCxDesignRouteToMarketData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oData.filter(function (obj) {
					var routeToMarketId = obj.RouteMrktId;
					var routeToMaketLayout = oController.byId("routeToMarket");
					routeToMaketLayout.getItems().filter(function (item) {
						if (item.getName() === routeToMarketId) {
							item.setSelected(true);
						}
					});
				});
				oController.defaultModel.setProperty("/to_ARouteMkt", oData);
			});
		},

		getCxDesignServiceRequestedData: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getCxDesignServiceRequestedData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oController.defaultModel.setProperty("/to_ASrvReq", oData);
				var oTempArr = oData.map(function (obj) {
					return obj.SrvReqstId;
				});
				oController.byId("serviceRequested").setSelectedKeys(oTempArr);
			});
		},

		getCxDesignIndustryData: function (oController, activityGUID) {
			var aFilter = [new Filter("ActivityGuid", "EQ", activityGUID)];
			oController.ServiceHelper.getCxDesignIndustryData(oController.oActFormODataModel, aFilter).then(function (result) {
				var oData = result.data.results;
				oController.defaultModel.setProperty("/to_AIndustry", oData);
				var oTempArr = oData.map(function (obj) {
					return obj.IndustryId;
				});
				oController.byId("cxDesignIndustry").setSelectedKeys(oTempArr);
				oController.fnSetActDetailGridsBusy("idActivityInfoTeam", false, 0);
			});
		}
	};
});