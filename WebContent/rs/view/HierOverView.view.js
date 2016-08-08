/**
 * In order to reuse the common framework of SAPUI5 (such as auto generate the setXX/getXX, here we extend a view from the sap.ui.core.mvc.JSView
 */
jQuery.sap.declare("rs.view.HierOverView");
jQuery.sap.require("rs.view.HierBaseView");
//jQuery.sap.require("sap.ui.core.Control");

//sap.ui.jsview("rs.view.HierOverView", {
rs.view.HierBaseView.extend("rs.view.HierOverView", {
	metadata : {
		//Here in order to avoid name conflict, we add rs to the property name
		properties : {
			"rsHierId":   'string',
			
			"rsHierType" : "string",
			
			"rsTabIdx" : "int",
			
			//the naviMng used to manage itself
			"naviMng" : "object",
		},
		// ---- control specific ----
		library : "sap.ui.core",

	},
	
	//Just reuse the JSView is enough
	renderer: 'sap.ui.core.mvc.JSViewRenderer',
	
	getControllerName: function() {
		return "rs.controller.HierOverView";
	},		
	
	/**
	 * Constant enum for the three views
	 */
	ViewType : {
		TreeMap:  0,
		TreeTable: 1		
	},
	
	/**
	 * Constant enum for budget/spending model
	 */
	ModelType: {
		Budget:  0,
		Spending: 1
	},
	
	isBudgetModel: function() {
		return this.getModelType() == this.ModelType.Budget;
	},
	
	
	/**
	 * Get the content header part height, need by consistent with the view implementation (normally is the information header and 
	 * the view switch part,  the detail view/lineItem/Trend need add the extra navigation part)
	 * Now use this static way because the jQuery.offset() only work for the visible element 
	 */
	getContentHeaderHeight: function() {
		//Now 55:  the heigh of rs.view.Help.createHeaderData  60: createSwitchToolbar()
		return rs.view.Help.HeaderDataHeight + this.SwitchToolbarHeight;
	},

	
	/**
	 * Update the main content (treeMap, TreeTable) right top side hint information 
	 */
	updateMainContentHintInfo : function() {
		var viewType = this.getViewType();
		
		var text = "";
		switch ( viewType) {
			case this.ViewType.TreeMap:
				if (this.isBudgetModel())
					text = rs.getText("BoxSizeInfoForBudget");
				else
					text = rs.getText("BoxSizeInfoForSpending");
				break;
			case this.ViewType.TreeTable:
				text = rs.view.Help.formatBoxSizeHintText( rs.getText("TableValueCurrencyHint"));
				break;
			default:
				rs.assert(0);
		}
		this._oBoxSizeInfoTextView.setText(text);
	},

	createSwitchToolbar : function() {

		//create the segment for switch between TreeMap, TreeTable
		var btnTreeMap =   new rs.cfg.Control.Button({
				icon:"images/OverviewTreeMapUnSelected.png",				
				activeIcon:"images/OverviewTreeMapSelected.png",
				width:"60px",
				});
		
		var btnTreeTable =  new rs.cfg.Control.Button({
	   	 		icon:"images/OverviewTableViewUnSelected.png",	    	 	
	    	 	activeIcon:"images/OverviewTableViewSelected.png",	    	 	
	    	 	width:"60px",
	    	 	});

				
		//set the enum data, so later easy know which view type
		btnTreeMap.setRSEnumData( this.ViewType.TreeMap);
		btnTreeTable.setRSEnumData( this.ViewType.TreeTable);
		
		var oSBViewType = new rs.cfg.Control.SegmentedButton({
			id:this.createId("sbtn_viewtype"),
			buttons:[ btnTreeMap, btnTreeTable]});
			         
		//first select treeMap
		oSBViewType.setSelectedButton(btnTreeMap);

		
		//Then create the budget/spending parts
		var  btnBudget = new rs.cfg.Control.Button({
			id : this.createId(this.BtnBudget),
			text : "{i18n>Budget}",
			textAlign:"Center",
			width:"80px",
		 	});
		var btnSpending = new rs.cfg.Control.Button({
			id : this.createId(this.BtnSpend),
			text : "{i18n>Spending}",
			textAlign:"Center",
			width:"80px",
			});
		
		//set the enum data, so later easy know which model type
		btnBudget.setRSEnumData( this.ModelType.Budget);
		btnSpending.setRSEnumData( this.ModelType.Spending);
		
		//create the segment for switch between Budget and Spending
		var oSBBudgetSpend = new rs.cfg.Control.SegmentedButton({
			id : this.createId("sbtn_budgetSpend"),
			buttons : [ btnBudget, btnSpending ]});
			
		oSBBudgetSpend.addStyleClass("overviewSwitchButton");	

		oSBBudgetSpend.setSelectedButton(btnBudget); 
		
		var oBoxSizeInfoTextView = new rs.cfg.Control.Text(this
				.createId('boxSizeInfo'), {
			textAlign : "Right",
			enabled: false,
			text:"{i18n>BoxSizeInfoForBudget}"
		});

		//set class variable
		this._oSBBudgetSpend = oSBBudgetSpend;
		this._oSBViewType = oSBViewType;
		
		this._oBoxSizeInfoTextView = oBoxSizeInfoTextView;
		
		//use the absolute layout for three items 
		this._oSwitchLayout = new sap.ui.commons.layout.AbsoluteLayout(
				this.createId('switch_toolbar'), {
			height : this.SwitchToolbarHeightPx
		}).addStyleClass("switch_toolbar");

		this._oSwitchLayout.addContent(oSBViewType,{
			left : "0px",
			top : "0px"
		});
		this._oSwitchLayout.addContent(oSBBudgetSpend,{
				left : "210px",
				top : "0px"
			});
		this._oSwitchLayout.addContent(oBoxSizeInfoTextView,{
			right : "0px",
			top : "35px"
		});
		
		return this._oSwitchLayout;
	},


	/**
	 * The real implementation function of create content
	 * @param oController
	 * @returns {sap.ui.commons.layout.VerticalLayout}
	 */
	createContentImpl : function(oController) {

		this._oHeadPart = rs.view.Help.createHeaderData(this.getId()); 
		this._addHiddenDiv4ShowHeaderAreaInfo();	
		
		var switchToolbar = this.createSwitchToolbar();
		this._oContentLayout = this.createContentLayout();

		//set all the width to 100%
		this._oHeadPart.setWidth('100%');
		switchToolbar.setWidth('100%');
		this._oContentLayout.setWidth('100%');
		this._oMainLayout = new sap.ui.commons.layout.VerticalLayout(
			this.createId('mainVerticalLayout'), 
			{
				content : [ this._oHeadPart, switchToolbar, this._oContentLayout ]
			}
		).addStyleClass("mainVerticalLayout");

		this._oMainLayout.setWidth('100%');
		
		//Create the main content part
		this._oTreeTable = this.createTreeTable(oController);
		//Also create the tree map and pie here 
		this._oTreeMapContainer = this.createTreeMapContainer();		

		var parentCell = sap.ui.getCore().byId(this.createId( 'contentCell'));
		this._oViewMng = new rs.view.InternalPageMng(parentCell, 0,
				[ this._oTreeMapContainer, this._oTreeTable]);
		
		return this._oMainLayout;
	},

	/**
	 * The title, which will be used to as the navigation title
	 * @returns
	 */
	getTitle: function() {
		var key=null;
		switch ( this.getRsHierType()) 
		{
			case rs.HierType.Dep:
				key = "Department";
				break;
			case rs.HierType.Exp:
				key = "ExpenseType";
				break;
			case rs.HierType.Prj:
				key = "Project";
				break;
			}
			return rs.getText(key);
		},
	
	
	/**
	 * Create the name column information 
	 */
	_createNameColumnInfo: function() {
		//the name label is different for different view type
		var label = "";
		switch ( this.getRsHierType()) {
			case rs.HierType.Dep:
				label = "{i18n>Department}";
				break;
			case rs.HierType.Exp:
				label = "{i18n>ExpenseType}";
				break;
			case rs.HierType.Prj:
				label = "{i18n>Project}";
				break;
		};
		
		var template = new rs.cfg.Control.Text({text:"{Name}",enabled: false}); 
		return ({ "label": label,  "template": template});
	}, 
		
	/**
	 * Create the variance column information
	 */
	_createVarianceColumnInfo: function() {

		var oLayout = new sap.ui.commons.layout.AbsoluteLayout( {height: "35px"});
		
		var img = new sap.ui.core.HTML();
		var contentParameter = "<div  style='position:relative;width:5px;height:30px;background-color:";
		var contentParameterEnd = ";\'></div>";
		
		//as it need several properties, so just binding to the parent using ""
		img.bindProperty("content","",function(oValue){
			//As now the ui5 framework have bug before binding to row it will also do the update
			if ( oValue == null)
				return "";
					
			color  = rs.view.getColorByVariancePercentage(oValue.VariancePercentage, oValue.Total);
			return contentParameter + color + contentParameterEnd;				
		});
		
		//the variance text view	
		var tvVariance = new rs.cfg.Control.Text({enabled: false});
		
		//as it need several properties, so just binding to the parent using ""
		tvVariance.bindProperty("text", "",function(oValue){
			var model= this.getModel();
			var ctx = this.getBindingContext();
			
			//As now the ui5 framework have bug before binding to row it will also do the update
			if ( oValue == null)
				return "";
			var variancePercentageFormat = rs.view.Help.formatVariancePercentage(oValue.VariancePercentage);
			var leftOver = oValue.Variance >= 0?rs.getText("Left") : rs.getText("Over");
			return rs.util.Util.numericPrecisonFormat(Math.abs(oValue.Variance))+variancePercentageFormat+ leftOver;
		});

		
		//add the content
		oLayout.addContent(img,{top:"2px",left:"2px"});
		oLayout.addContent(tvVariance,{top:"10px",left:"10px"});

		return ({ "label": "{i18n>Variance}",  "template": oLayout});
	},
	
	/**
	 * Create the tree table and bind templates
	 * @returns {sap.ui.table.TreeTable}
	 */
	createTreeTable : function(oController) {
			//create all the column information 
			var cols = [];
			cols.push(  this._createNameColumnInfo() );
			
			//For the Actual, Committed,Budget,Actual, all is same (As the backend data is  Commited, so here use same also)
			var keys = ["Actual", "Commited", "Total", "Budget"];
			$.each( keys, function( idx, key) {
				cols.push(
						{ 
							label: "{i18n>" + key + "}",
							template:  new rs.cfg.Control.Text({enabled: false}).bindProperty(
									"text", key ,rs.util.Util.numericPrecisonFormat)	
						} );
			});
			//last is the variance part 
			cols.push(  this._createVarianceColumnInfo() );
			
			//the following code just set the each column width ratio, 
		    var flexiableWidthRatio = [2.5, 1, 1, 1, 1, 1.5];	//for "Name" "Actual", "Committed", "Total", "Budget","Variance"
		    var total = 0;
		    for(var i=0 ;i <flexiableWidthRatio.length;i++){
		    	total += flexiableWidthRatio[i];
		    }
		    
		    //then add by same way
		    var columns = [];
			$.each(cols, function(idx, ele) {
				columns.push(new sap.ui.table.Column({
					label : ele.label,
					template: ele.template,
					width: flexiableWidthRatio[idx]*100/total +"%"
				}));
			});

			var strHeight = Math.round(this.getMainContentHeight()) -50 + 'px';
			var strWidth = this.getMainContentWidth() + 'px';

			var oTable = new rs.cfg.Control.TreeTable(
					this.createId("TreeTable"),
					{
					width: strWidth,
					height: strHeight,	
					columns: columns,
					expandFirstLevel: true	
					});

			//oTable.setWidth('100%');
			
			//register call back 
			oTable.attachRowSelectionChange(oController.onTreeTableRowSelected, oController);

			return oTable;
	},

	/**
	 * Create the tree map container  ?? later need change
	 * @returns {sap.ui.commons.layout.MatrixLayout}
	 */
	createTreeMapContainer : function() {
	
		var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
		 	layoutFixed : true,
			columns : 1,
			width : "100%",
			widths:["100%"]
		});
		
		
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMatrixLayout.addRow(oRow);				

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell(
			{	
				id :	this.createId('TreeMapViewMatrixCell'),
				hAlign:	sap.ui.commons.layout.HAlign.Center
			});
	
		oRow.addCell(oCell);
		return oMatrixLayout;	
	},

	

	/**
	 * The doInit function will called after finished set the parameter
	 * !! the init() will be called by framework, but at that time don't have the parameter such as the hierType, so don't have enough knowledget to do init work
	 */
	doInit : function() {
		this.calculateMainContentWidthHeight();
		
		var controller = this.getController();
		
		var content = this.createContentImpl(controller);
		this.addContent(content);
		
		//set the active table for export the table to CSV
		this.setActiveTable(this._oTreeTable);
		
		//Set two switch control to parent
		this.setViewSwitchControl( this._oSBViewType);
		this.setModelSwitchControl( this._oSBBudgetSpend);
		
		//Attach segment button call back
		this._oSBViewType.attachSelect(controller.onViewTypeChanged, controller);

		this._oSBBudgetSpend.attachSelect(controller.onModelTypeChanged, controller); 
		
		//Now know the height, so can adjust table height
		this.adjustTreeTableHeight(this._oTreeTable);
	
		//set legend mode
		this.setLegendMode(rs.view.LegendMode.Main);
		//so add here for three different view?
		rs.cfg.Cfg.addChangeListener(controller.onConfigChanged, controller, null);
		

	},
	
	_refreshScreenForCfgChanged:function(){

		//As we need keep the current table collapse status, so just use invalidate to let it rerender
		this._oTreeTable.invalidate();

		var treemap = sap.ui.getCore().byId(this.createId("treeMapView"));
		
		treemap.refreshTreeMap();
		
		this.updateMainContentHintInfo();
	},
	
	
	//============================= The TreeMap related functions
	_reAddTreeMapToContainer: function(){
		
		//first delete the old content
		var cell = sap.ui.getCore().byId(this.createId( 'TreeMapViewMatrixCell'));
		cell.destroyContent();
		
		var treeMapData = rs.model.ModelMng.getSpendData4TreeMap(this.getRsHierType());

		//body margin 8*2, martix layout td padding 4*2
		//var width = Math.round(($("body").width() -16)* 0.9) - 8;
		var width = this.getMainContentWidth();
		var height =  Math.round(this.getMainContentHeight()) -20; //20 for alignment
		
		var strWidth = width + 'px';
		var strHeight = height + 'px';
		
		var that = this;
		var treeMap = new rs.uilib.TreeMap(this.createId("treeMapView"),
			{
				width:strWidth,
				height: strHeight,
				data: treeMapData,
				nameSelector:this._nameSelector,
				valueSelector:function(d){
 	    	  		return that._valueSelector(d);
 	    	  	},
				colorSelector:rs.view.colorSelector,
			}
		);
		
		var controller = this.getController();
		
		treeMap.attachPress(controller.onTreeMapClick, controller);
		treeMap.attachZoom(controller.onTreeMapZoom, controller);

		cell.addContent(treeMap);
		
		this._oTreeMap = treeMap;
	},		
	
	_nameSelector: function(d){
		if(d.depth == 1){
			  var leftOver = d.Variance >= 0?rs.getText("Left") : rs.getText("Over");
			  var variancePercentageFormat = rs.view.Help.formatVariancePercentage(d.VariancePercentage);
	          var varianceFormat = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(d.Variance))
	          												+variancePercentageFormat+leftOver; 
			return d.Name +"</br>"+varianceFormat;	  								
		}
		else{
			return d.Name;
		}
		
	},
	
	_valueSelector:function(d){     	
		return  this.isBudgetModel()?d.Budget:d.Total;
	},

	 
      /* the following function just add the hidden div to show the pop while click the header area*/
	_addHiddenDiv4ShowHeaderAreaInfo : function(){		
		var hiddenDivId = this.getId() + '--hiddenDiv';
		var width = this.getMainContentWidth()+"px";
		var height = this._oHeadPart.getHeight();
		
		var oHideDiv = new sap.ui.core.HTML();
		var contentParameter = "<div id= "+ hiddenDivId+ " style=\'width:"+width +";height:"+height+";background-color:transparent";
		var contentParameterEnd = ";\'></div>";
		
		oHideDiv.setContent(contentParameter + contentParameterEnd);
		
		this._oHeadPart.addContent(oHideDiv, {
			left : "0px",
			top : "0px"
		});
		
		//As it must use the jQuery to bind, so must after it has been redered then can find the id
		var controller = this.getController();
		oHideDiv.attachAfterRendering( function() {
			// the following code is just compatible with the IE9 ,actually when the hiddenDiv is render, the the container is always rendered
			$("#"+this.getId()+'--headerData').bind(
					'click',  function(event) { controller.onHeaderAreaClicked(event); 	});			
			
		}, this );   /*Here the this is the oListener*/	
	},	
	
	
	onResize:function(event){
		this.calculateMainContentWidthHeight();
		var strWidth = this.getMainContentWidth() + 'px';
		var strHeight =  Math.round(this.getMainContentHeight()) -20 + 'px'; //20 for alignment		

		if(this._oTreeMap)
		{
			this._oTreeMap.setWidth(strWidth);
			this._oTreeMap.setHeight(strHeight);
			this._oTreeMap.invalidate();
		}
		this.adjustTreeTableHeight(this._oTreeTable);
						
		if(this._oDetailView)
		{
			this._oDetailView.onResize();
		}
		

	},	
	
	//==private internal member 
	_oSBBudgetSpend : null,
	_oSBViewType : null,

	_oTreeTable : null,
	_oTreeMapContainer : null,

	_oModelInfo : null,

	_oViewMng : null,
	
	_oTreeMap: null,
	_oHeadPart: null, 
	
	//===some constant text id
	BtnBudget : 'btn_budget',
	BtnSpend : 'btn_spend',

	//!!tips: the last is the corresponding idx
	BtnTreeMap : 'btn_map_table_pie_0',
	BtnTreeTable : 'btn_map_table_pie_1',
	BtnPieMap : 'btn_map_table_pie_2',
		
	_oDetailView: null,
	
});
