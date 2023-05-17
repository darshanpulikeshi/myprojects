sap.ui.define(
  ["com/test/activityreg/model/formatter", "sap/ui/core/format/DateFormat"],
  function (formatter, DateFormat) {
    return {
      formatDate: function (date) {
        var dateFormat = DateFormat.getDateInstance({
          style: "medium",
        });
        if (date && date !== null && date !== "") {
          return dateFormat.format(date);
        } else {
          return null;
        }
      },
      setDC: function (value1, value2) {
        return value1 === value2;
      },
      setCheckBox: function (dc_id) {
        if (this.getView().getModel("dcModel").getObject("/dcObjects")) {
          if (
            !this.getView().getModel("dcModel").getObject("/dcObjects")[dc_id]
              .checkBox
          ) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      toInteger: function (str) {
        if (str) {
          return parseInt(str, 10);
        }
      },
      formatCancelTxt: function (i18nTxt, date, user) {
        if (date) {
          return this._oResourceBundle.getText("xmsg.cancelledActivityPopup", [
            this.formatter.formatDate(date),
            user,
          ]);
        }
      },
      setAvatarSrc: function (value) {
        if (value !== "" && value !== null && value !== undefined) {
          if (this.constants["0040"]) {
            return this.constants["0040"].field_value + value;
          }
          // return "https://avatars.wdf.sap.corp/avatar/" + value;
        } else {
          return "./images/user.jpg";
        }
      },
      formatLTypeDescription: function (TypeDescription, Type) {
        if (TypeDescription !== "") {
          return TypeDescription;
        } else {
          return this.getView()
            .getModel("masterDataModel")
            .getProperty("/LTypeMap")[Type];
        }
      },
      selectDemoSurveyRecpt: function (DemoLead, DemoSurveyRecpt) {
        if (DemoSurveyRecpt) {
          return DemoSurveyRecpt;
        } else {
          return DemoLead;
        }
      },
      assignCustomData: function (activityTypeId, title) {
        if (activityTypeId === "0012") {
          return "cxrfp";
        } else if (
          activityTypeId === "0013" &&
          title &&
          title.split(" ")[1].toUpperCase() !== "DETAILS"
        ) {
          return "ea";
        } else {
          return "";
        }
      },
      showUserDeleteIcon: function (userID) {
        if (userID && userID !== "") {
          return true;
        } else {
          return false;
        }
      },
      showRequestorMgrDeleteIcon: function (userID, actTypeId) {
        if (userID && userID !== "" && actTypeId && actTypeId === "0013") {
          return true;
        } else {
          return false;
        }
      },
      handleAddOppSelectbuttonTxt: function (sOppId) {
        var bAddOppSelectFlag = false;
        if (sOppId) {
          var tokens = this.getView()
            .byId("additionalOpptMultiInput")
            .getTokens();
          $.each(tokens, function (index, token) {
            if (parseInt(token.getText()) === parseInt(sOppId)) {
              bAddOppSelectFlag = true;
            }
          });
        }
        if (bAddOppSelectFlag) {
          return "Deselect";
        } else {
          return "Select";
        }
      },
      handleAddOppToggleBtnPressed: function (sOppId) {
        var bAddOppSelectFlag = false;
        if (sOppId) {
          var tokens = this.getView()
            .byId("additionalOpptMultiInput")
            .getTokens();
          $.each(tokens, function (index, token) {
            if (parseInt(token.getText()) === parseInt(sOppId)) {
              bAddOppSelectFlag = true;
            }
          });
        }
        if (bAddOppSelectFlag) {
          return bAddOppSelectFlag;
        }
      },

      imageFallback: function (imgSrc, assetType) {
        var sRootPath = jQuery.sap.getModulePath(
          "com.presalescentral.activityform"
        );
        try {
          if (imgSrc.trim()) return imgSrc;
          else if (assetType == "I" || assetType == "P" || assetType == "T")
            return sRootPath + "/images/desktop_def.png";
          else return sRootPath + "/images/mob_def.png";
        } catch (err) {
          return sRootPath + "/images/fallback.png";
        }
      },
      formatAccountDetails: function (value) {
        if (value && value !== "") {
          return value;
        } else {
          return "Unavailable";
        }
      },

      //Commenting below function, as it can be used when account field is required to be shown in Demo like activity types
      //As of now the below function is not used in UI, but can be called in ActivityInformation.fragment.xml
      fnSetCVAAccountVisible: function (
        isEditMode,
        oActivityId,
        oActivitySetId,
        ActivityTypeId,
        oAssociateType
      ) {
        if (isEditMode === true && oActivityId && oActivitySetId) {
          if (
            ActivityTypeId === "0001" ||
            ActivityTypeId === "0003" ||
            ActivityTypeId === "0006" ||
            ActivityTypeId === "0012" ||
            ActivityTypeId === "0015"
          ) {
            if (oAssociateType === 1) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else if (
          ActivityTypeId !== "0001" &&
          ActivityTypeId !== "0003" &&
          ActivityTypeId !== "0005" &&
          ActivityTypeId !== "0006" &&
          ActivityTypeId !== "0012" &&
          ActivityTypeId !== "0013" &&
          ActivityTypeId !== "0014" &&
          ActivityTypeId !== "0015" &&
          ActivityTypeId !== "0016"
        ) {
          return true;
        } else {
          return false;
        }
      },

      setAccountOwnerDeleteVisible: function (value) {
        if (value) {
          return true;
        } else {
          return false;
        }
      },

      //Function to set Information Icon btn visible True/False
      fnSetOpportunityInfoBtnVisible: function (
        bShowOpportunityDetails,
        ActivityTypeId
      ) {
        var oppotunityModel = this.getView().getModel("opportunityModel");
        var oppoId = oppotunityModel.getProperty(
          "/selectedOpportunity/OPPT_ID"
        );
        //var accountid = oppotunityModel.getProperty("/selectedOpportunity/accountid");
        if (oppoId && bShowOpportunityDetails) {
          return true;
        } else {
          return false;
        }
      },

      //Function to set Remove opportunity btn visible True/False
      fnSetOpportunityDeleteBtnVisible: function (
        isEnabled,
        bShowOpportunityDetails,
        FormLayoutID
      ) {
        var oppotunityModel = this.getView().getModel("opportunityModel");
        var oppoId = oppotunityModel.getProperty(
          "/selectedOpportunity/OPPT_ID"
        );
        if (
          oppoId &&
          isEnabled &&
          bShowOpportunityDetails &&
          FormLayoutID !== "00013"
        ) {
          return true;
        } else {
          return false;
        }
      },

      //Function to set Busy indicator for individual drop down fields across sections
      setFieldBusyIndicator: function (dropDownMasterData) {
        if (dropDownMasterData === undefined) {
          return true;
        } else if (dropDownMasterData.length >= 0) {
          return false;
        }
      },

      //Function to set visible Copy Activity button
      setCopyActivityBtnVisible: function (
        editMode,
        initSlaGuid,
        editSlaGuid,
        createMode
      ) {
        var isCopied = this.getView().getController().oStorage.get("isCopied");
        if (createMode === "DETAIL_ACTIVITY") {
          return false;
        } else {
          if (
            editSlaGuid === "00000000-0000-0000-0000-000000000000" &&
            editMode &&
            (isCopied === "" || isCopied === null)
          ) {
            return true;
          } else {
            return false;
          }
        }
      },

      //Function to set Detail page header title
      setDetailPageTitle: function (
        ActivityDesc,
        GlobalUltimateID,
        OpportunityNumber,
        ActvtAsstdID,
        AccountName,
        ActivitySetdescription
      ) {
        var title = "";
        if (ActivityDesc) {
          title = ActivityDesc;
        }
        if (ActvtAsstdID === "501") {
          if (AccountName) {
            var str =
              title + " : " + AccountName + " : Acct. Num. " + GlobalUltimateID;
            if (str.length > 70) {
              title = str.substring(0, 70) + "...";
            } else {
              title =
                title +
                " : " +
                AccountName +
                " : Acct. Num. " +
                GlobalUltimateID;
            }
          } else {
            title = title;
          }
        } else if (ActvtAsstdID === "502") {
          if (AccountName) {
            var str =
              title + " : " + AccountName + " : Opp. Num. " + OpportunityNumber;
            if (str.length > 70) {
              title = str.substring(0, 70) + "...";
            } else {
              title =
                title +
                " : " +
                AccountName +
                " : Opp. Num. " +
                OpportunityNumber;
            }
          } else {
            title = title;
          }
        } else if (ActvtAsstdID === "503") {
          if (ActivitySetdescription) {
            title = title + " : " + ActivitySetdescription;
          } else {
            title = title;
          }
        }
        return title;
      },

      //Function to set Detail page header title
      setDetailPageTitleTooltip: function (
        ActivityDesc,
        GlobalUltimateID,
        OpportunityNumber,
        ActvtAsstdID,
        AccountName,
        ActivitySetdescription
      ) {
        var title = "";
        if (ActivityDesc) {
          title = ActivityDesc;
        }
        if (ActvtAsstdID === "501") {
          if (AccountName) {
            title =
              title + " : " + AccountName + " : Acct. Num. " + GlobalUltimateID;
          } else {
            title = title;
          }
        } else if (ActvtAsstdID === "502") {
          if (AccountName) {
            title =
              title + " : " + AccountName + " : Opp. Num. " + OpportunityNumber;
          } else {
            title = title;
          }
        } else if (ActvtAsstdID === "503") {
          title = title + " : " + ActivitySetdescription;
        }
        return title;
      },

      //Detail Page: Format Risk Text based on ID
      formatRiskButtonText: function (riskId) {
        var riskBtnTxt = "";
        if (riskId === "01") {
          riskBtnTxt = "Red";
        } else if (riskId === "02") {
          riskBtnTxt = "Yellow";
        } else if (riskId === "03") {
          riskBtnTxt = "Green";
        }
        return riskBtnTxt;
      },

      //Detail Page: Function to convert drodown data to string
      formatArrayToString: function (oArray, aOldSols) {
        var str = "";
        if (oArray && Array.isArray(oArray)) {
          oArray.filter(function (obj) {
            if (obj.hasOwnProperty("Description")) {
              str = str + obj.Description + "\n";
            } else if (obj.hasOwnProperty("BsnsAreaEngdDesc")) {
              str = str + obj.BsnsAreaEngdDesc + "\n";
            } else if (obj.hasOwnProperty("LevelDesc")) {
              str = str + obj.LevelDesc + "\n";
            } else if (obj.hasOwnProperty("SolutionDesc")) {
              str = str + obj.SolutionDesc + "\n";
            } else if (obj.hasOwnProperty("CrossTopicDesc")) {
              str = str + obj.CrossTopicDesc + "\n";
            } else if (obj.hasOwnProperty("content_id")) {
              str = str + obj.content_desc + "\n";
            } else if (obj.hasOwnProperty("OpportunityNo")) {
              str = str + obj.OpportunityNo + "\n";
            } else if (obj.hasOwnProperty("PhaseId")) {
              str = str + obj.PhaseDesc + "\n";
            } else if (obj.hasOwnProperty("Url")) {
              str = str + obj.Url + "\n";
            } else if (obj.hasOwnProperty("RegionMu")) {
              str = str + obj.RegionMu + "\n";
            } else if (obj.hasOwnProperty("IndustryDesc")) {
              str = str + obj.IndustryDesc + "\n";
            } else if (obj.hasOwnProperty("SrvReqstDesc")) {
              str = str + obj.SrvReqstDesc + "\n";
            }
          });
          if (aOldSols) {
            if (aOldSols.length > 0) {
              aOldSols.filter(function (solObj) {
                str = str + solObj + "\n";
              });
            }
          }
        }
        return str;
      },

      //Detail Page: Function to get Dropdown keys to string
      formatKeysArrayToString: function (oDataArray, oKeysArray, ActivityId) {
        var str = "";
        if (oKeysArray && Array.isArray(oKeysArray) && oDataArray) {
          var oKeyMap = {};
          oKeysArray.filter(function (key) {
            oKeyMap[key] = key;
          });
          for (var i in oDataArray) {
            if (oKeyMap.hasOwnProperty(oDataArray[i].content_id)) {
              str = str + oDataArray[i].content_desc + "\n";
            }
          }
        }
        return str;
      },

      formatDropdownKeyToText: function (oArray, oSelectedKey, ActivityId) {
        var str = "";
        if (oArray === undefined) {
          return str;
        }
        if (oArray.length > 0 && Array.isArray(oArray) && oSelectedKey) {
          var oTempArr = [];
          if (ActivityId && oArray[0].hasOwnProperty("acttypeid")) {
            oArray.filter(function (obj) {
              if (obj.hasOwnProperty("acttypeid")) {
                if (obj.acttypeid === ActivityId) {
                  oTempArr.push(obj);
                }
              }
            });
          } else if (ActivityId && oArray[0].hasOwnProperty("ActvtTypeId")) {
            oArray.filter(function (obj) {
              if (obj.hasOwnProperty("ActvtTypeId")) {
                if (obj.ActvtTypeId === ActivityId) {
                  oTempArr.push(obj);
                }
              }
            });
          } else if (ActivityId && oArray[0].hasOwnProperty("ActvtTypeID")) {
            oArray.filter(function (obj) {
              if (obj.hasOwnProperty("ActvtTypeID")) {
                if (obj.ActvtTypeID === ActivityId) {
                  oTempArr.push(obj);
                }
              }
            });
          } else {
            oTempArr = oArray;
          }
          oTempArr.filter(function (obj) {
            if (obj.hasOwnProperty("methodid")) {
              if (obj.methodid === oSelectedKey) {
                str = obj.description;
              }
            } else if (obj.hasOwnProperty("id")) {
              if (obj.id === oSelectedKey) {
                str = obj.description;
              }
            } else if (obj.hasOwnProperty("customtype_id")) {
              if (obj.customtype_id === oSelectedKey) {
                str = obj.customtype_desc;
              }
            } else if (obj.hasOwnProperty("status_id")) {
              if (obj.status_id === oSelectedKey) {
                str = obj.status_desc;
              }
            } else if (
              obj.hasOwnProperty("RegionId") &&
              !obj.hasOwnProperty("MuId")
            ) {
              if (obj.RegionId === oSelectedKey) {
                str = obj.RegionDescription;
              }
            } else if (obj.hasOwnProperty("AudienceID")) {
              if (obj.AudienceID === oSelectedKey) {
                str = obj.AudienceDesc;
              }
            } else if (obj.hasOwnProperty("IndustryId")) {
              if (obj.IndustryId === oSelectedKey) {
                str = obj.IndustryDesc;
              }
            } else if (obj.hasOwnProperty("MuId")) {
              if (obj.MuId === oSelectedKey) {
                str = obj.MuDesc;
              }
            }
          });
        }
        return str;
      },

      //Detail page: Function to get Virtual studio text from ID in Activity Detail section
      formatVirtualStudioKeyToStr: function (oArray, oSelectedKey, ActivityId) {
        var str = "";
        if (oArray && Array.isArray(oArray) && oSelectedKey) {
          var oTempArr = [];
          oArray.filter(function (obj) {
            if (obj.dmid === "S") {
              oTempArr.push(obj);
            }
          });
          oTempArr.filter(function (obj) {
            if (obj.hasOwnProperty("id")) {
              if (obj.id === oSelectedKey) {
                str = obj.description;
              }
            }
          });
        }
        return str;
      },

      //Detail page: Function to get Status text from ID in Activity Detail section
      formatActStatsuKeyToStr: function (oArray, oSelectedKey, ActivityId) {
        var str = "";
        if (oArray && Array.isArray(oArray) && oSelectedKey) {
          var oTempArr = [];
          oArray.filter(function (obj) {
            if (obj.ProjectType === "ACTVT_CVA") {
              oTempArr.push(obj);
            }
          });
          oTempArr.filter(function (obj) {
            if (obj.hasOwnProperty("StatusId")) {
              if (obj.StatusId === oSelectedKey) {
                str = obj.StatusDescription;
              }
            }
          });
        }
        return str;
      },

      formatCanceledTxt: function (i18nTxt, date) {
        if (date) {
          return this._oResourceBundle.getText("xtit.cancelled", [date]);
        }
      },

      setDeliverableIcons: function (FileName, FileType) {
        var icon = "";
        switch (FileType) {
          case "text/plain":
            icon = "sap-icon://document-text";
            break;
          case "":
            icon = "sap-icon://chain-link";
            break;
        }
        return icon;
      },

      formatRiskIconState: function (RiskAssessId) {
        if (RiskAssessId === "01") {
          return "Negative";
        } else if (RiskAssessId === "02") {
          return "Critical";
        } else if (RiskAssessId === "03") {
          return "Positive";
        }
      },

      setDemoSurveyAvatarSrc: function (demoSurvey, actLead) {
        if (demoSurvey) {
          return this.constants["0040"].field_value + demoSurvey;
        } else if (actLead) {
          return this.constants["0040"].field_value + actLead;
        } else {
          return "./images/user.jpg";
        }
      },

      //Detail Page: Account Owner visibility
      formatAcountOwnerVisiblilty: function (teamUserObj) {
        if (teamUserObj) {
          if (Object.keys(teamUserObj).length) {
            if (teamUserObj.EMAIL && teamUserObj.ID) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      formatContentKMVisibility: function (aFiles) {
        if (aFiles) {
          if (aFiles.length === 1) {
            if (
              aFiles[0].DocumentType === "0001" &&
              aFiles[0].Status === "X" &&
              aFiles[0].Url === "" &&
              aFiles[0].FileId === ""
            ) {
              return false;
            } else {
              return true;
            }
          } else if (aFiles.length > 1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      setDemoEnvSectionVisible: function (
        to_ALand,
        to_AShowroom,
        to_ASuccessFactor,
        to_ACloudEnv
      ) {
        if (to_ALand && to_AShowroom && to_ASuccessFactor && to_ACloudEnv) {
          if (
            to_ALand.length > 0 ||
            to_AShowroom.length > 0 ||
            to_ASuccessFactor.length > 0 ||
            to_ACloudEnv.length > 0
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      setDemoEnvEducationCldVisible: function (to_ALand) {
        if (to_ALand) {
          var oTempArr = [];
          if (to_ALand.length) {
            to_ALand.filter(function (obj) {
              if (obj.Ltype === "0") {
                oTempArr.push(obj);
              }
            });
            if (oTempArr.length) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      setDemoEnvOtherLandVisible: function (to_ALand) {
        if (to_ALand) {
          var oTempArr = [];
          if (to_ALand.length) {
            to_ALand.filter(function (obj) {
              if (obj.Ltype !== "0") {
                oTempArr.push(obj);
              }
            });
            if (oTempArr.length) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      formatEditBtnVisiblity: function (
        isAuthorized,
        isArchived,
        isCXRFPUser,
        formLayoutID,
        isAcademyUser,
        slStatusId
      ) {
        if (
          (isAuthorized === "X" && isArchived === false) ||
          (isCXRFPUser === "X" &&
            formLayoutID === "00012" &&
            isArchived === false) ||
          (isAcademyUser === "X" && formLayoutID === "00015")
        ) {
          if (slStatusId !== "12") {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      formatEditBtnTooltip: function (
        isAuthorized,
        isArchived,
        isCXRFPUser,
        formLayoutID,
        isAcademyUser
      ) {
        if (
          (isAuthorized === "X" && isArchived === false) ||
          (isCXRFPUser === "X" &&
            formLayoutID === "00012" &&
            isArchived === false) ||
          (isAcademyUser === "X" && formLayoutID === "00015")
        ) {
          return "Edit activity";
        } else {
          return "Not authorized to edit activity";
        }
      },

      formatArchiveBtn: function (
        isAuthorized,
        isArchived,
        actStatus,
        isCXRFPUser,
        formLayoutID,
        isAcademyUser
      ) {
        if (
          (isAuthorized === "X" &&
            isArchived === false &&
            (actStatus === "12" || actStatus === "14" || actStatus === "02")) ||
          (isCXRFPUser === "X" &&
            formLayoutID === "00012" &&
            isArchived === false &&
            (actStatus === "12" || actStatus === "14" || actStatus === "02")) ||
          (isAcademyUser === "X" &&
            formLayoutID === "00015" &&
            isArchived === false &&
            (actStatus === "12" || actStatus === "14" || actStatus === "02"))
        ) {
          return true;
        } else {
          return false;
        }
      },

      formatUnArchiveBtn: function (
        isAuthorized,
        isArchived,
        actStatus,
        isCXRFPUser,
        formLayoutID,
        isAcademyUser
      ) {
        // removed isExpired ==="X" condition bcz of discontinued opp
        if (
          (isAuthorized === "X" && isArchived === true) ||
          (isCXRFPUser === "X" &&
            formLayoutID === "00012" &&
            isArchived === true) ||
          (isAcademyUser === "X" &&
            formLayoutID === "00015" &&
            isArchived === true)
        ) {
          return true;
        } else {
          return false;
        }
      },

      //Function to set Detail page SL Associated name
      setDetailPageSLName: function (slName) {
        var oTxt = "Part of SuccessLine: ";
        if (slName) {
          oTxt = "Part of SuccessLine: " + slName;
          if (oTxt.length > 40) {
            oTxt = "Part of SuccessLine: " + slName.substring(0, 20) + "...";
          } else {
            oTxt = "Part of SuccessLine: " + slName;
          }
        }
        return oTxt;
      },
      formatAddOppDate: function (date) {
        var dateFormat = DateFormat.getDateInstance({
          style: "medium",
        });
        if (date && date !== null && date !== "") {
          return dateFormat.format(new Date(date));
        } else {
          return null;
        }
      },
      formatStatus: function (StatusId) {
        return this.oStorage.get("pcOppStatusMasterMap")[StatusId].VALUE;
      },

      setSwitchText: function (operationStatus) {
        if (operationStatus === "X" || operationStatus) {
          return "Enabled";
        } else {
          return "Disabled";
        }
      },
      formatCompleteTxt: function (
        completeTxt,
        islead,
        isArchived,
        statusString
      ) {
        if (islead && isArchived === false) {
          return completeTxt;
        } else {
          return "Activity is marked as " + statusString + ".";
        }
      },
      formatActivityPastDateTxt: function (
        actExpiredTxt,
        reqExpiredTxt,
        isServiceRequest
      ) {
        if (isServiceRequest) {
          return reqExpiredTxt;
        } else {
          return actExpiredTxt;
        }
      },

      /////////////////////////////////////////////////////////////////////////////////////////////
      //Set Solutions Tree control's checkbox visibility
      formatSolTreeCheckBox: function (MatTblSelectMode, isCheckBoxVisible) {
        var bVal = false;
        if (MatTblSelectMode === "MultiSelect") {
          bVal = isCheckBoxVisible;
        }
        return bVal;
      },

      //Set Solutions Tree control's radiobutton visibility
      formatSolTreeRadioBtn: function (MatTblSelectMode, isRadioBtnVisible) {
        var bVal = false;
        if (MatTblSelectMode === "SingleSelectLeft") {
          bVal = isRadioBtnVisible;
        }
        return bVal;
      },

      //Function to set Checkbox and Radiobutton set set selected from Tree
      fnSetSolCBRBSelected: function (
        LevelId,
        L4Id,
        L5Id,
        LevelCount,
        isParent
      ) {
        var bVal = false;
        var oSolutionsModel = this.oSolutionsModel;
        var oSolTempArr = oSolutionsModel.getProperty("/oSolTempArr");
        if (oSolTempArr) {
          oSolTempArr.filter(function (obj, index) {
            if (
              obj.L4Id === L4Id &&
              obj.LevelCount === 4 &&
              obj.LevelId === LevelId
            ) {
              bVal = true;
              if (
                oSolutionsModel.getProperty("/MatTblSelectMode") ===
                "SingleSelectLeft"
              ) {
                if (obj.ValueState === "Information") {
                  bVal = false;
                }
              }
            }
            if (
              obj.L5Id === L5Id &&
              obj.LevelCount === 5 &&
              obj.LevelId === LevelId
            ) {
              bVal = true;
            }
          });
        }
        return bVal;
      },

      //Function to set Checkbox and Radiobutton set set selected from Table
      fnSetMatCBRBSelected: function (MatId) {
        var bVal = false;
        var oMatTempArr = this.oSolutionsModel.getProperty("/oMatTempArr");
        if (oMatTempArr) {
          oMatTempArr.filter(function (obj, index) {
            if (obj.MatId === MatId) {
              bVal = true;
            }
          });
        }
        return bVal;
      },

      //Function to set valuestate for L4's radiobutton, if L5 is selected
      formatSolTreeRadioBtnValState: function (LevelId, L4Id) {
        var valueState = "None";
        var oSolTempArr = this.oSolutionsModel.getProperty("/oSolTempArr");
        if (oSolTempArr) {
          oSolTempArr.filter(function (obj, index) {
            if (
              obj.L4Id === L4Id &&
              obj.LevelCount === 4 &&
              obj.LevelId === LevelId
            ) {
              valueState = obj.ValueState;
            }
          });
        }
        return valueState;
      },

      fnSetDetailPageActivityStatus: function (status) {
        var oMessage = "";
        var defaultModel = this.getView().getModel("default");
        var appProperties = this.getView().getModel("appProperties");
        var Archived = defaultModel.getProperty("/Archived");
        if (appProperties) {
          var isLead = appProperties.getProperty("/isLead");
        }
        switch (status) {
          case "02":
            var CancledOn = defaultModel.getProperty("/CancledOn");
            var CanceledByName = defaultModel.getProperty("/CanceledByName");
            if (CancledOn) {
              oMessage = this._oResourceBundle.getText(
                "xmsg.cancelledActivityPopup",
                [this.formatter.formatDate(CancledOn), CanceledByName]
              );
            }
            break;
          case "12":
            oMessage = this._oResourceBundle.getText("cmpltdActvtTxt", [
              "completed",
            ]);
            oMessage = this.formatter.formatCompleteTxt(
              oMessage,
              isLead,
              Archived,
              "completed"
            );
            break;
          case "14":
            oMessage = this._oResourceBundle.getText("cmpltdActvtTxt", [
              "customer validated",
            ]);
            oMessage = this.formatter.formatCompleteTxt(
              oMessage,
              isLead,
              Archived,
              "customer validated"
            );
            break;
        }
        return oMessage;
      },

      fnSetDetailPageActivityStatusIcon: function (status) {
        var icon = "";
        switch (status) {
          case "02":
            icon = "sap-icon://cancel";
            break;
          case "12":
            icon = "sap-icon://complete";
            break;
          case "14":
            icon = "sap-icon://sys-enter";
            break;
        }
        return icon;
      },

      //Only for method dropdown
      formatActDetMethodVal: function (oArray, oSelectedKey, ActivityId) {
        var masterDataModel = this.getView().getModel("masterDataModel");
        var isMethodOldVal = masterDataModel.getProperty("/isMethodOldVal");
        if (isMethodOldVal) {
          return this.defaultModel.getProperty("/MethodDescription");
        } else {
          return this.formatter.formatDropdownKeyToText(
            oArray,
            oSelectedKey,
            ActivityId
          );
        }
      },
    };
  }
);
