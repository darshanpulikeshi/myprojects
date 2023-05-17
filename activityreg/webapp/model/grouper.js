sap.ui.define(["com/test/activityreg/model/grouper"
], function(grouper) {
	return {
		createGroupHeader: function(oGroup) {
			return new sap.m.GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});
		},
		createShowroomGroupHeader: function(oGroup){
			this.aShowroomLocation.push(oGroup);
			return new sap.m.GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});		
		},
		createSolutionGroupHeader: function(oGroup){
			this.aSolutionAreaDesc.push(oGroup);                        
			return new sap.m.GroupHeaderListItem({
				title: oGroup.desc,
				upperCase: false
			});	
		},
		setGroupHeaderSolutions: function(oContext) {
			if (oContext) {
				return {desc:oContext.getProperty("SolAreaDesc"),key:oContext.getProperty("SolaraId")};
			}
		},
		setGroupHeaderLandsape: function(oContext){
			if (oContext) {
				if(oContext.getProperty("SelectionCat") !== "Master"){
					return oContext.getProperty("SelectionCat");
				}else{
					return oContext.getProperty("LTypeDescription");
				}
			}	
		},
		setGroupHeaderShowroom: function(oContext){
			if (oContext) {
				if(oContext.getProperty("SelectionCat") !== "M"){
					return {key:"Recent Selections",selectCat:oContext.getProperty("SelectionCat")};
				}else{
					return {key:oContext.getProperty("Location"),selectCat:oContext.getProperty("SelectionCat")};	
				}
			}	
		}
	};
});