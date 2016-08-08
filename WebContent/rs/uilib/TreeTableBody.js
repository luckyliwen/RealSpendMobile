sap.ui.core.Control.extend('rs.uilib.TreeTableBody', {
	metadata: 
	{
		properties: 
		{
			"parentTable": "object"
		}
	},
  
	renderer: function(oRm, oControl) 
	{
		var parentTable = oControl.getParentTable();
		
		oRm.write("<table id=" + parentTable.treeTableId + ">");
		oRm.write("<tbody'>");
		
		var rows = parentTable.getRows();
		rows.forEach( function( row) 
		{
			row.setParentTable( parentTable);
			oRm.renderControl(row);
		});
		
		oRm.write("</tbody>");
		oRm.write("</table>");
	},
});
