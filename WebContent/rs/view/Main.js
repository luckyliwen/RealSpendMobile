/**
 * this class is the main class which will cooperate with the other component, so it just use the global class instead of teh sap.ui.jsview
 */
rs.view.TabIdx = {
	Dep : 0,
	Exp : 1,
	Prj : 2
};

sap.ui.jsview("rs.view.Main", {
	
	getControllerName: function() {
		return "rs.controller.Main";
	},	

	init: function(){
		this._oController = this.getController();
	},

	createContent: function(oController) {
	},
	
	_init : function() {
		this._createTopViews();
		
		this.onReady();
	},

	/*
	*Simulate user click a tab, used by pie select, or click the alert jump to other view, for ux3 and normal tab have different action
	*/
	simulateTabItemClicked: function(idx) {
		
		var the_tabs = $('.tab');
		the_tabs.eq(idx).click();			
	},

	/**
	 * 
	 */
	onReady: function() {
		this.bindEvents();
	},
	
	/**
	 * Bind the events, this must be called after document finished load
	 */
	bindEvents : function() {
		this._bindTopViewsEvent();
		this._bindResizeEvent();
		

		//As the jQuery bind can't set the context, so use the $.proxy to ensure the correct context
		$('#rs_alert').bind('click', $.proxy(rs.view.Alert.showAlert, rs.view.Alert));
		
		//bind the calendar event
		$('#rs_calendar').bind('click', $.proxy(rs.cfg.onTimePeriodClicked, rs.cfg));
			
		//bind the exporting event
		$('#rs_share').bind('click', $.proxy(rs.view.Help.doExport, rs.view.Help));

		/* 
		 * firefox can't use window.event to get mouse position,  we bind mouse down event, 
		 * to store mouse position.
		 */ 
	},

	/**
	 * According to the current setting and last time setting adjust the Project tab and project view
	 */
	updateProjectTabAndView: function() {
		//hide or show the project tab
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			$('#rs_tab_2').show();
		} else {
			$('#rs_tab_2').hide();
		}
		
		//then the project view	
		//But for the Prj, only create it when configure the parameter
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			if ( this._aTopView.length == 2) {
				//old not exists, need add
				var prjNaviMng = this._createPrjViewAndNaviMng();
				prjNaviMng.doInit();
				
				this._aTopView.push( prjNaviMng);
				this._oTopViewMng.addPage(prjNaviMng);
			}
		} else {
			if ( this._aTopView.length == 3) {
				//old exists, need remove from PageMng and _aTopView
				this._oTopViewMng.removeLastPage();
				this._aTopView.pop();
			}
		}
	},
	
	/**
	 * Call back for the backend basic data load successful
	 */
	OnBackendBasicDataLoadSucc : function() {
		if (!this._bViewCreated) {
			//Now know the backend configuration, so know how to create main panel
			this._init();
			
			
			this.updateProjectTabAndView();
			
			//then ask all the view to load the data
			for ( var i = 0; i < this._aTopView.length; i++) {
				this._aTopView[i].getMainPage().getController().loadData();
			}
		} else {
			//Update the pie number first
			this._overViewPage.updatePieNum( this.getPieNum() );
			
			//When switch demo/network mode, the project may dispear or appear, so need do update
			this.updateProjectTabAndView();
			
			//then ask all the view to load the data
			for ( var i = 0; i < this._aTopView.length; i++) {
				this._aTopView[i].getMainPage().getController().reloadData();
			}
			
		}
	},

	/**
	 * 
	 * @param bSwitchDemoNetworkMode: if true, then is caused by switch between the demo/network mode, 
	 *                                otherwise, the first time call back then need do the init work to create view content   
	 */
	onBackendBasicDataLoadFail : function(error,bSwitchDemoNetworkMode) {
		//??If failed, can do nothing
		/*
		alert('Load data from backend ' + rs.cfg.Cfg.getBaseUrl()
				+ ' failed:\r\n' + rs.util.Util.getInforFromError(error));
		*/
		rs.util.Util.showErrorMessage(null, error, null, null);
				
	},


	getTabIdxByHierType:function(hierType){
		return this._getTabIdxByHierType(hierType);
	},
	
	_createNaviMngForHierOverView: function(view) {
		var naviMng = sap.ui.view({
			id : 'navi-' + view.getId(),
			viewName : "rs.view.NaviMng",
			type : sap.ui.core.mvc.ViewType.JS,
			viewData: {'type': view.getRsHierType()}
		});
		
		//and set the relationship for each other
		naviMng.setMainPage(view);
		view.setNaviMng(naviMng);
		return naviMng;
	},
	
	/**
	 * Create the Project view and the wrapped NaviMng view
	 */
	_createPrjViewAndNaviMng: function() {
		if (this._oPrjNaviMng) {
			return this._oPrjNaviMng;
		}
		
		var viewPrj = new rs.view.HierOverView("PrjOV", {
			rsHierType : rs.HierType.Prj,
			rsTabIdx : rs.view.TabIdx.Prj,
			viewName : 'rs.view.HierOverView'
		});
		viewPrj.doInit();
		
		this._oPrjNaviMng = this._createNaviMngForHierOverView(viewPrj);
		return this._oPrjNaviMng;
	},
	
	getPieNum: function() {
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			return 3;
		} else {
			return 2;
		}
	},
	
	_createTopViews : function() {
		sap.ui.localResources("rs");

		var viewDep = new rs.view.HierOverView("DepOV", {
			rsHierType : rs.HierType.Dep,
			rsTabIdx : rs.view.TabIdx.Dep,
			viewName : 'rs.view.HierOverView',
		});
		
		var viewExp = new rs.view.HierOverView("ExpOV", {
			rsHierType : rs.HierType.Exp,
			rsTabIdx : rs.view.TabIdx.Exp,
			viewName : 'rs.view.HierOverView'
		});
		
		//now can ask the hierView to do the init work as it has enough info now
		viewDep.doInit();
		viewExp.doInit();
		
		
		this._aTopView.push(this._createNaviMngForHierOverView(viewDep));
		this._aTopView.push(this._createNaviMngForHierOverView(viewExp));
		
		//But for the Prj, only create it when configure the parameter
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			var prjNaviMng = this._createPrjViewAndNaviMng();
			this._aTopView.push( prjNaviMng);
		}
		
		//now can do init work
		for ( var i = 0; i < this._aTopView.length; i++) {
			this._aTopView[i].doInit();
		}

		this._oTopViewMng = new rs.view.PageMng('data-view', this._aTopView);
		this._oTopViewMng.setActivePage(rs.view.TabIdx.Dep);
	},

	//??just make it work, the old code
	_bindTopViewsEvent : function() {

		/* Caching the tabs into a variable for better performance: */
		var the_tabs = $('.tab');
		var that = this;

		the_tabs.click(function(e) {
			/* "this" points to the clicked tab hyperlink: */
			var element = $(this);

			/* If it is currently active, return false and exit: */
			if (element.parent().attr('class') != null
					&& element.parent().attr('class') != '')
				return false;
			
			/* Deactivate all tabs, here should use .tabs>li instead of pure li, as it may affect other li*/
			$('.tabs>li').each(function(index) {
				$(this).removeClass();
			});
			
			/* Activate focused tab*/
			element.parent().addClass("active");

			//console.log(this._oController);

			/* Execute afterClick method */
			//rs.view.Main._onTopTabClicked(element.attr('id'));
			that._oController.onTopTabClicked(element.attr('id'));
		});
		

		the_tabs.eq(0).click();
	},

	_bindResizeEvent:function(){
		var that = this;
		var resizeTimer = null;
		$(window).resize(function(event) {
			if (resizeTimer)
			{
				clearTimeout(resizeTimer);
				resizeTimer = null;
			}
			resizeTimer = setTimeout(function() 
			{
				for ( var i = 0; i < that._aTopView.length; i++) 
				{
					that._aTopView[i].getMainPage().onResize();
				}			   
			}, 250);
			  
		});		
	},	
	
	_getTabIdxByHierType: function(hierType) {
		switch (hierType) {
			case rs.HierType.Dep:  return rs.view.TabIdx.Dep;
			case rs.HierType.Exp:  return rs.view.TabIdx.Exp;
			case rs.HierType.Prj:  return rs.view.TabIdx.Prj;
			default:
				rs.assert(false);
		}
	},

	
	//The topmost 4 tabs 
	_overViewPage : null, //just a shorthand 

	_aTopView : [],
	_oTopViewMng : null,
	
	_bViewCreated: false,
	
	//The project navigation mng view, here need a separate variable because when switch between the demo/network mode, it may appear/disappear, 
	//so save it here can be reused later
	_oPrjNaviMng: null,
	
	_oController: null,
});