sap.ui.define([
	"com/test/activityreg/service/CoreService"
], function (CoreService) {
	"use strict";

	var ListServiceHelper = CoreService.extend("com.test.activityreg.service.ServiceHelper", {

		initializeNewActivity: function (oModel, data) {
			return this.odata("/Yc_Mac_T_Act_Main", oModel).post(data);
		},

		getMelodyQuickLinks: function (oModel) {
			var mParameters = {
				urlParameters: "$expand=to_params,to_child/to_params"
			};
			return this.odata("/YC_MD_T_NAVMENU", oModel).get(mParameters);
		},

		getActivityMainData: function (oModel, aFilters, urlParams) {
			var mParameters = {
				filters: aFilters,
				urlParameters: urlParams
			};
			return this.odata("/Yc_Mac_T_Act_Main", oModel).get(mParameters);
		},

		getGTMAreMasterData: function (oModel) {
			return this.odata("/YC_MAC_M_GTM_AREA", oModel).get();
		},

		getConstantData: function (oModel) {
			return this.odata("/Yc_Mac_M_Constants", oModel).get();
		},

		getCxrfpSolutions: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_M_Solutions", oModel).get(mParameters);
		},

		getMethodData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_M_Method", oModel).get(mParameters);
		},

		getCountryMasterData: function (oModel) {
			return this.odata("/YC_MAC_M_ACTVT_CNTRY", oModel).get();
		},

		getRoleMasterData: function (oModel) {
			return this.odata("/YC_ROLE_ACTVT_FRMACSS", oModel).get();
		},

		getRoleBasedActivityTypes: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_ROLE_ACTVT_FORMACCESS_USER", oModel).get(mParameters);
		},

		getActivitySets: function (oModel) {
			return this.odata("/Yc_Mac_M_Actity_Set", oModel).get();
		},

		getActInfoRegion: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_REGION", oModel).get(mParameters);
		},

		getActInfoIndustry: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_INDUSTRY", oModel).get(mParameters);
		},

		getActInfoMu: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_MU", oModel).get(mParameters);
		},

		getCXRFPStatus: function (oModel) {
			return this.odata("/YC_MAC_M_CXRFP_STAT", oModel).get();
		},

		getActivityDetailTypes: function (oModel) {
			return this.odata("/Yc_Mac_M_Activity_Det_Type", oModel).get();
		},

		getActDetSalesLOB: function (oModel) {
			return this.odata("/YC_MAC_M_SALES_LOB", oModel).get();
		},

		getActDetBusinessAreaEngaged: function (oModel) {
			return this.odata("/YC_MAC_M_BSNSAREAENGD", oModel).get();
		},

		getActDetRiskButtons: function (oModel) {
			return this.odata("/Yc_Mac_M_Risk_Asses", oModel).get();
		},

		getActDetDMChildValues: function (oModel) {
			return this.odata("/YC_MAC_M_DM_CHILD_VALUES", oModel).get();
		},

		getActDetScopes: function (oModel) {
			return this.odata("/YC_MAC_M_SCOPE", oModel).get();
		},

		getActDetEngagementTypes: function (oModel) {
			return this.odata("/YC_MAC_M_ENG_TYPE", oModel).get();
		},

		getActDetProjectStatus: function (oModel) {
			return this.odata("/YC_MAC_M_ACTVT_STATUS", oModel).get();
		},

		getActDetProjectTypes: function (oModel) {
			return this.odata("/YC_MAC_M_PROJ_TYPE", oModel).get();
		},

		getActDetHostTypes: function (oModel) {
			return this.odata("/YC_MAC_M_HOST_TYPE", oModel).get();
		},

		getActDetUseCase: function (oModel) {
			return this.odata("/YC_MAC_M_USE_CASE", oModel).get();
		},

		getActDetDeliveryTeam: function (oModel) {
			return this.odata("/YC_MAC_M_DELV_TEAM", oModel).get();
		},

		getActDetVendorId: function (oModel) {
			return this.odata("/YC_MAC_M_VENDOR", oModel).get();
		},

		getActDetTAOptions: function (oModel) {
			return this.odata("/YC_MAC_M_TA_OPT", oModel).get();
		},

		getActDetImpact: function (oModel) {
			return this.odata("/YC_MAC_M_IMPACT", oModel).get();
		},

		getActDetPreferDCID: function (oModel) {
			return this.odata("/YC_MAC_M_DC_MASTER", oModel).get();
		},

		getActSetIndustry: function (oModel) {
			return this.odata("/YC_MOP_INDUSTRY", oModel).get();
		},

		getAttachmentTypes: function (oModel) {
			return this.odata("/YC_MAC_M_ATTACH_TYPE", oModel).get();
		},

		getDemoDataCenters: function (oModel) {
			return this.odata("/Yc_Mac_M_Datacenter", oModel).get();
		},

		getActDetPhase: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_PHASE", oModel).get(mParameters);
		},

		getActDetAudience: function (oModel) {
			return this.odata("/YC_MAC_M_AUDIENCE", oModel).get();
		},

		getActivityTypeID: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters,
				urlParameters: "$select=ActivityTypeId,ActivityGuid,ActvtAsstdID"
			};
			return this.odata("/Yc_Mac_T_Act_Main", oModel).get(mParameters);
		},

		getPreferedDCMapping: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_PREF_DC", oModel).get(mParameters);
		},

		getSolutionMasterData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_M_Solutions", oModel).get(mParameters);
		},

		getActTypeExpand: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_TYP_EXPAND", oModel).get(mParameters);
		},

		getAuthFlag: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_FORM_ACCESS", oModel).get(mParameters);
		},

		//Activty information section
		getActInfoOppoDetails: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_AOpportunity";
			return this.odata(sUrl, oModel).get();
		},

		getActInfoAddOppoDetails: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_AAddOpp";
			return this.odata(sUrl, oModel).get();
		},

		getActInfoAccountDetails: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_AAccnt";
			return this.odata(sUrl, oModel).get();
		},

		getActAddOpportunities: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_ADD_OPP", oModel).get(mParameters);
		},

		//Activty team section
		getOppoProfitCenter: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Opp_Pc", oModel).get(mParameters);
		},

		getActTeamMembers: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Actteam", oModel).get(mParameters);
		},

		//Activity Detail section
		getActDetailType: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Activity_Details_Type", oModel).get(mParameters);
		},

		getActDetailAddSolution: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_ASol";
			return this.odata(sUrl, oModel).get();
		},

		getActDetailMaterials: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_AMaterial";
			return this.odata(sUrl, oModel).get();
		},

		getActDetailTaxonomy: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_ATaxonomy";
			return this.odata(sUrl, oModel).get();
		},

		getActDetailPhase: function (oModel, activityGUID) {
			var sUrl = "/Yc_Mac_T_Act_Main(guid'" + activityGUID + "')/to_APhase";
			return this.odata(sUrl, oModel).get();
		},

		getActLandscape: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Landscapes", oModel).get(mParameters);
		},

		getActSuccessFactors: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Success_F", oModel).get(mParameters);
		},

		getActCloudEnv: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Cloud_Env", oModel).get(mParameters);
		},

		getActAttachments: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_FILE_CONTENT", oModel).get(mParameters);
		},

		//Get seleced audience
		getActDetAudienceData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_AUDIENCE", oModel).get(mParameters);
		},

		getActDetBusinessAreaEng: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_BSNSARENGD", oModel).get(mParameters);
		},

		getActDetPhases: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_PHASE", oModel).get(mParameters);
		},

		getActComments: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_COMMENTS", oModel).get(mParameters);
		},

		getActRegStatusMasterData: function (oModel) {
			return this.odata("/YC_MAC_M_STATUS_LIST", oModel).get();
		},

		getActivityGUID: function (aFilters, oModel) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_M_Solutions", oModel).get(mParameters);
		},

		getActTeamMemberDetails: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_MD_Usersearch", oModel).get(mParameters);
		},

		getSLAccOppFlds: function (oModel, slGUID) {
			var sUrl = "/YC_SL_ACT_DETAILS(guid'" + slGUID + "')";
			return this.odata(sUrl, oModel).get();
		},

		getLayoutData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_FORM_LAYOUT", oModel).get(mParameters);
		},

		getActLeadData: function (oModel, aFilters, sQuery) {
			var oParameters = {
				urlParameters: {
					search: sQuery
				},
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_USER_LIST", oModel).get(oParameters);
		},

		getSolutionHierarchy: function (oModel, aFilters) {
			return this.odata("/YC_MD_SOL_HIER", oModel).get();
		},

		getLevel2MasterData: function (oModel, aFilters) {
			return this.odata("/YC_MD_SOL_M_LEVEL2", oModel).get();
		},

		fnCreateActivitySet: function (oModel, data) {
			return this.odata("/Yc_Mac_T_ActSetUsr", oModel).post(data);
		},

		getDuplicateRegistrations: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_OPP_ACC", oModel).get(mParameters);
		},

		getOpptProfitCenterData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/Yc_Mac_T_Opp_Pc", oModel).get(mParameters);
		},

		getMasterData: function (oModel, aFilters, sPath) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata(sPath, oModel).get(mParameters);
		},

		//func to get user day and date restriction
		getUserActivityDays: function (oModel, sPath) {
			return this.odata(sPath, oModel).get();
		},

		fnCreateNotifyMe: function (oModel, data) {
			return this.odata("/YC_MAC_T_NOTIFY", oModel).post(data);
		},

		fnDeleteNotifyMe: function (oModel, data) {
			return this.odata("/YC_MAC_T_NOTIFY(ActivityGuid=guid'" + data.ActivityGuid + "',ActvtTeamUserId='" + data.ActvtTeamUserId +
				"')", oModel).delete();
		},

		fnAddUsertoOppTeam: function (oModel, data) {
			return this.odata("/Yc_Mac_T_Actteam", oModel).post(data);
		},

		fnPostCommentToUtilityServ: function (oModel, data) {
			return this.odata("/YC_MD_COMMENTS", oModel).post(data);
		},

		fnPostCommentToActService: function (oModel, data) {
			return this.odata("/YC_MAC_T_ACTCOMMENT", oModel).post(data);
		},

		fnDeleteUserComment: function (oModel, data) {
			return this.odata("/YC_MD_COMMENTS(CommentGuid=guid'" + data.CommentGuid + "')", oModel).delete();
		},

		fnPerformActivityActions: function (oModel, data) {
			return this.odata("/Yc_Mac_T_Act_Main(guid'" + data.ActivityGuid + "')", oModel).put(data);
		},

		getRegionMu: function (oModel) {
			return this.odata("/YC_MOP_REGION_MASTER", oModel).get();
		},

		getServiceRequestedData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_SRV_REQUESTED", oModel).get(mParameters);
		},

		getRouteToMarket: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_ROUTE_MARKET", oModel).get(mParameters);
		},

		getCxDesignRegionMu: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_M_ACT_REGION_MU", oModel).get(mParameters);
		},

		getCxDesignRegionMuData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_ACT_REGION_MU", oModel).get(mParameters);
		},

		getCxDesignRouteToMarketData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_ROUTE_MARKET", oModel).get(mParameters);
		},

		getCxDesignServiceRequestedData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_SRV_REQUESTED", oModel).get(mParameters);
		},

		getCxDesignIndustryData: function (oModel, aFilters) {
			var mParameters = {
				filters: aFilters
			};
			return this.odata("/YC_MAC_T_INDUSTRY", oModel).get(mParameters);
		},

		getNonOreAuth: function (oModel) {
			let defaultProject = "ACTVT";
			let URL = "/YC_UT_AUTH_CHECK(ProjectType='" + defaultProject + "')";
			return this.odata(URL, oModel).get();
		},

	});
	return new ListServiceHelper();
});