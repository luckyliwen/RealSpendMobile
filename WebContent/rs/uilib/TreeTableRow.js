sap.ui.core.Control.extend("rs.uilib.TreeTableRow", {
  	metadata: 
	{
		properties: 
		{
			"parentTable": "object",
			"expanded" : {type : "boolean", group : "Misc", defaultValue : false},
			"columnsCreated":   {type : "boolean", group : "Behavior", defaultValue : false},
		},
		
		defaultAggregation : "rows",
		aggregations : {
			//by the nodes can establish the hierarchy
	    	"rows" : {type : "rs.uilib.TreeTableRow", multiple : true, singularName : "row",bindable: 'bindable'},
			
			//just simulate how a tree table works
	    	//??way 1, just use 
	    	'columns': { type: 'sap.ui.core.Control', multiple: true, singularName: 'column', bindable: 'bindable'}
		},
	},
	
	
	_createColumns: function() {

		
		if (this.getColumnsCreated()) 
		{
			var colInstantces = this.getColumns();
			
			for (var i = 0, l = colInstantces.length; i < l; i++)
			{
				colInstantces[i].setBindingContext( this.getBindingContext() );			
			}
		}
		else
		{
			
			var parentTable = this.getParentTable();
			var aCols = parentTable.getColumns();
			
			for (var i = 0, l = aCols.length; i < l; i++) 
			{
				
				var oColTemplate = aCols[i].getTemplate();
				if (oColTemplate) {
					
					var id = this.getId() + "-col-" + i;
					
					var oClone = this._cloneOneColumn(oColTemplate, id);
					
					this.addColumn(oClone);
				}
			}
			
			this.setColumnsCreated(true);
		}
		
	},	
	
	/**
	 * By the template clone one control
	 */
	_cloneOneColumn: function(template, id) {
		var oClone = template.clone( id );
		oClone.setBindingContext( this.getBindingContext() );
		
		return oClone;
	},
	
	
	/**
	 * return "" means don't have parent
	 * @returns
	 */
	getParentId: function() {
		var parent = this.getParent();
		if ( parent instanceof rs.uilib.TreeTableRow) {
			return parent.getId(); 
		} else {
			return "";
		}
	},
	
	renderRowSelf: function(oRm) {
		var ttId = 'data-tt-id= "' +  this.getId() + '"';
		var parentId = this.getParentId(); 
		if( parentId != "")
		{
			ttId += ' data-tt-parent-id= "' + parentId + '"';
		}		
		
		oRm.write('<tr ' + ttId);
		oRm.writeControlData(this);
		oRm.writeClasses();
		//oRm.addStyle("width", oControl.getWidth());
		//oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		this._createColumns();
		
		//As the row.columns and the TreeTable.columns can map one to one, so use the same index to get that
		var  parentTable = this.getParentTable();
		var  parentColumns = parentTable.getColumns();
		var colInstantces = this.getColumns();
		
		for (var i=0; i<parentColumns.length; i++)
		{
			//??wrong, should be
			var col = parentColumns[i];
			
			if(false == col.getVisible())
			{
				continue;
			}
			
			oRm.write("<td");
			if(col.getHAlign)
			{
				oRm.addStyle("text-align", col.getHAlign());
			}

			if(col.getWidth())
			{
				oRm.addStyle("width", col.getWidth());
			}
			
			oRm.writeStyles();
			oRm.write(">");

			//Then render the col instance
			oRm.renderControl( colInstantces[i]);
			oRm.write("</td>");
		}
		
		oRm.write("</tr>");
	},
	
	onBeforeRendering: function()
	{
		var parentTable = this.getParentTable();
		if(parentTable.touchEnabled)
		{
			this.$().unbind("tap", this.handleClick);
		} 
		else
		{
			this.$().unbind("click", this.handleClick);	
		}
	},
	
	onAfterRendering: function()
	{
		var parentTable = this.getParentTable();

		if(parentTable.touchEnabled)
		{
			this.$().bind('tap', $.proxy(this.handleClick, this));
		} 
		else
		{
			this.$().unbind("click", this.handleClick);	
		}		
	},
	
	renderer : function(oRm, oControl) 
	{
				
		oControl.renderRowSelf(oRm);
		
		//then check how to render it child 
		var  subRows = oControl.getRows();
		subRows.forEach( function( subRow) {
			
			//also need first set the parentTable 
			subRow.setParentTable(oControl.getParentTable());
			
			oRm.renderControl(subRow);
		});
	},
	
	handleClick: function(event) 
	{

		var $target = $(event.target);
		
		var parentTable = this.getParentTable();

		if( $target.is("a") ) 
		{
			var bExpand = false;
			if($('#' + this.getId()).hasClass("expanded"))
			{
				bExpand = true;
				this.setExpanded(true);
			}
			else
			{
				this.collapse();
			}
			parentTable.fireToggleOpenState({rowContext: this.getBindingContext(), expanded: bExpand});	     		
		}
		else
		{
			var strSelect = '#' + parentTable.getId() + ' tr.selected';
			$(strSelect).removeClass("selected");
			$('#' + this.getId()).addClass("selected");
			var position = [event.originalEvent.clientX||event.clientX, event.originalEvent.clientY||event.clientY];
			parentTable.fireRowSelectionChange({rowContext: this.getBindingContext(), position: position, control: this});
		}
	},
	
	hasChildren : function()
	{
		var aSubRows = this.getRows();
		if(aSubRows.length){
			return true;
		}
		return false;
	},
	
	setExpanded:function(value)
	{
		this.setProperty("expanded", value, true); //to avoid re-rendering
	},
	
	initExpandedStatus: function(context)
	{
		if(context && context.expanded)
		{
			this.setExpanded(true);
			if(context.child)
			{
				var aSubRows = this.getRows();
				for(var i=0; i<aSubRows.length; i++)
				{
					aSubRows[i].initExpandedStatus(context.child[i]);
				}
			}
		}
		else
		{
			this.setExpanded(false);
		}
	},
	
	getExpandedStatus:function()
	{
		var context = {};
		context.expanded = this.getExpanded();
		
		if(this.hasChildren())
		{
			context.child = [];
			var aSubRows = this.getRows();
			for(var i=0; i<aSubRows.length; i++)
			{
				context.child[i] = aSubRows[i].getExpandedStatus();
			}
		}
		
		return context; 
	},
	
	expand:function()
	{
		this.setExpanded(true);
		var aSubRows = this.getRows();
		for(var i=0; i<aSubRows.length; i++)
		{
			aSubRows[i].expand();
		}
	},
	
	collapse:function()
	{
		this.setExpanded(false);
		var aSubRows = this.getRows();
		for(var i=0; i<aSubRows.length; i++)
		{
			aSubRows[i].collapse();
		}
	}
	

});

rs.uilib.TreeTableRow.prototype.init = function() {
	//console.error("Init the TreeTableRow ");
};