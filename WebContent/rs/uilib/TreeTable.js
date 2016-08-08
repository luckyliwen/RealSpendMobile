sap.ui.core.Control.extend("rs.uilib.TreeTable", {
	metadata: 
	{
		properties: 
		{
			"width" : {type: "sap.ui.core.CSSSize", defaultValue: "1024px"},
			"height" : {type: "sap.ui.core.CSSSize", defaultValue: "350px"},
			"showHeader": {type: "boolean", defaultValue: true},
			"expandFirstLevel" : {type : "boolean", group : "", defaultValue : false},
			"body":   "object",
		},
		
		defaultAggregation : "rows",
		
		aggregations : 
		{
			//by the nodes can establish the hierarchy
	    	"rows" : {type : "rs.uilib.TreeTableRow", multiple : true, singularName : "row", bindable: 'bindable'},
	    	"columns" : {type : "sap.ui.table.Column", multiple : true, singularName : "column", bindable : "bindable"}, 
		},
		
		events : 
		{
			"rowSelectionChange" : {}, 
			"toggleOpenState" : {},
			"columnSelect" : {allowPreventDefault : true}, 
			"columnResize" : {allowPreventDefault : true}, 
			"columnMove" : {allowPreventDefault : true}, 
			"sort" : {allowPreventDefault : true}, 
			"filter" : {allowPreventDefault : true}, 
			"group" : {allowPreventDefault : true}, 
			"columnVisibility" : {allowPreventDefault : true}
		}
		
	}, 

	updateAggregation : function(sName, sPath, oTemplate) 
	{
		if(this.bFirstTimeRender)
		{
			return sap.ui.core.Element.prototype.updateAggregation.apply(this, arguments);
		}
		else
		{
			this.composeExpandStatus();
			var result =  sap.ui.core.Element.prototype.updateAggregation.apply(this, arguments);
			this.restoreExpandStatus();
			return result;
		}
	},


	unbindAggregation : function(sName, sPath, oTemplate) 
	{
		return sap.ui.core.Element.prototype.unbindAggregation.apply(this, arguments);
	},

	bindAggregation : function(sName, sPath, oTemplate) 
	{
		this.bFirstTimeRender = true;
		if(oTemplate)
		{
			return sap.ui.core.Element.prototype.bindAggregation.apply(this, arguments);	
		}
		else
		{
			var row = new rs.uilib.TreeTableRow({});
			return sap.ui.core.Element.prototype.bindAggregation.call(this, sName, sPath, row);
		}
		
	},

	init : function() 
	{
		this.treeTableId = this.getId() + "-treeTable";
		this.treeTableHeaderId = this.getId() + "-treeTableHeader";
		this.touchEnabled = (jQuery.sap.touchEventMode !== "OFF");
	},

	renderer : function(oRm, oControl) 
	{
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		oControl.renderHeader(oRm);
		oControl.renderTable(oRm);
		
		oRm.write("</div>");
	},

	renderHeader:function(oRm)
	{
		var column = this.getColumns();
		
		oRm.write("<table id=" + this.treeTableHeaderId + " class=treetableHeader>");
		oRm.write("<thead>");
		for(var i=0; i<column.length; i++) 
		{
			if(false == column[i].getVisible())
			{
				continue;
			}
			else
			{
				oRm.write("<th");
				if(column[i].getHAlign())
				{
					oRm.addStyle("text-align", rs.util.Util.getHAlign(column[i].getHAlign()));
				}
				
				if(column[i].getWidth())
				{
					oRm.addStyle("width", column[i].getWidth());
				}
				
				oRm.writeStyles();
				oRm.write(">");			
				
				oRm.renderControl(column[i].getLabel());
				oRm.write("</th>");
			}
		} 
		oRm.write("</thread>");
		oRm.write("</table>");
	},
	
	renderTable:function(oRm)
	{
		var height = parseInt(this.getHeight());
		height = Math.max(0, height -30);
		
		var strHeight = height + 'px';
	
		var body = new rs.uilib.TreeTableBody({
									"treeTableId": this.treeTableId,
									});
		body.setParentTable( this);
		this.setBody(body);
		
		var scrollContainer = new sap.m.ScrollContainer({
							content: [body],
							horizontal: false,
							vertical: true,
							height: strHeight,
							});
							
		scrollContainer.addStyleClass("treetableContainer");							
		oRm.renderControl(scrollContainer);
	},
	

	
	composeExpandStatus: function()
	{
		this.expandContext = [];
		var subRows = this.getRows();
		for(var i=0; i<subRows.length; i++)
		{
			this.expandContext[i] = subRows[i].getExpandedStatus();
		}
	},

	restoreExpandStatus:function()
	{
		var subRows = this.getRows();
		for(var i=0; i<subRows.length; i++)
		{
			if(this.expandContext[i])
			{
				subRows[i].initExpandedStatus(this.expandContext[i]);
			}
		}

	},
	
	expandRowAfterRendering:function(root)
	{
		var subRows = root.getRows();
		if(this.getExpandFirstLevel() && this.bFirstTimeRender)
		{
			for(var i=0; i<subRows.length; i++)
			{
				subRows[i].setExpanded(true);
			}
		}  
		
		var tableId = '#' + this.treeTableId;
		var root = this;
		
		expandRow(root);
		
		function expandRow (node)
		{
			var subRows = node.getRows();
			for(var i=0; i<subRows.length; i++)
			{
				if(subRows[i].getExpanded())
				{
					$(tableId).treetable('expandNode', subRows[i].getId());
					expandRow(subRows[i]);
				}
			}			
		} 
	},

	onAfterRendering: function() 
	{
		
		$('#' + this.treeTableId).treetable({ expandable: true });
		this.expandRowAfterRendering(this); 
		this.bFirstTimeRender = false;
	},
  
	bFirstTimeRender: true,
  
}); //end of sap.ui.core.Control.extend("rs.uilib.TreeTable")

rs.uilib.TreeTable.M_EVENTS = {'rowSelectionChange':'rowSelectionChange', 'toggleOpenState':'toggleOpenState'};

rs.uilib.TreeTable.prototype.isTreeBinding = function(sName) {
	return (sName == "rows");
};
