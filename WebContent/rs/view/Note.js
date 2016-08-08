/**
 * define the note control 
 */
rs.view.Note = {
		
	
	/**
	 * this will init three note panels, NewPanel, ListPanel 
	 * and DetailPanel.
	 */
	init:function()
	{
		this.bInited = true;
		
		this._initNewNote();
		this._initListNote();
	},	 
		
		
	/**
	 * show the note list popup after note click operation
	 * @param oEvent	: this will get the click row and get the bind path
	 */
	showNoteList:function(oEvent)
	{
		
		if(!this.bInited)
		{
			this.init();
		}
		
		// get bind data first
		this.attachedObj   = oEvent.getParameters().object;
		var context =  this.attachedObj.getBindingContext();
		var path        = context.sPath;			
		var data        = context.oModel.getProperty(path);
		
		// get byHerId
		var aHierId = [data.CCHierarchyNodeID, data.CEHierarchyNodeID, data.IOHierarchyNodeID];

		this.hierGroup.depId = data.CCHierarchyNodeID;
		this.hierGroup.expId = data.CEHierarchyNodeID;
		this.hierGroup.prjId = data.IOHierarchyNodeID;
		
		//As now the ModeMng part data structure has changed, now the Topmost detail put under the spendData/Detail4Top, 
		//so need use string lookup instead of just get the first node
		
		var that = this;
		//First get the hierId
		$.each(aHierId, function(idx, id) {
			if ( id != "") {
				var pos = path.indexOf( id );
				if (pos != -1 ) {
					that.hierId = id; 
				}
			}
		});  		
		
		//then get the byId
		$.each(aHierId, function(idx, id) {
			if ( id != "" && id != that.hierId) {
				that.byHierId = id;
			}
		});  		
		
		this.fiscalYear  = data.FiscalYear;
		
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(rs.model.Note.getNotesArrayByHierarchy(this.hierId, this.byHierId, this.fiscalYear)); 
		this.noteList.setModel(oModel);
		this.noteList.bindAggregation('items', '/', this.itemTemplate);
		
		this.showNoteListPopover();
		
	},
	
	showNoteListPopover:function()
	{
		if(this.newNotePopover._isOpened)
		{
			this.newNotePopover.close();
		}
		this.noteListPopover._isOpened = true;
		this.noteListPopover.openBy(this.attachedObj);
		
	},
	
	showNewNodePopover:function()
	{
		this.noteListPopover.close();
		this.noteTextArea.setValue("");
		this.newNotePopover.openBy(this.attachedObj);
	},
		
	/**
	 * the successful recall function for rs.model.Note.createNote 
	 * and rs.model.Note.deleteNote
	 * @param operation		: the operation mode Add or Delete a note
	 */
	onCreateSucc:function(operation)
	{	
		rs.model.ModelMng.updateNoteCount4Tree(this.hierId, this.byHierId, rs.NoteOperation.Add);
		
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(rs.model.Note.getNotesArrayByHierarchy(this.hierId, this.byHierId, this.fiscalYear)); 
		this.noteList.setModel(oModel);
		this.noteList.bindAggregation('items', '/', this.itemTemplate);
		rs.view.Help.refreshScreenForNotesUpdated(this.hierId,this.byHierId);		
		this.showNoteListPopover();
	},
	
	/**
	 * the failure recall function for rs.model.Note.createNote
	 * and rs.model.Note.deleteNote
	 */
	onCreateFail:function(error){
		rs.util.Util.showErrorMessage(null, error, null, null);
	},

	createNote:function()
	{
		rs.model.Note.createNote(this.noteTextArea.getValue(), this.hierGroup, this.onCreateSucc, this.onCreateFail, this, rs.NoteOperation.Add);
	},
		
	/**
	 * this will create a new note panel named oNewPanel.
	 * @returns {sap.ui.commons.Panel}
	 */
	_initNewNote:function()
	{
		var that = this;
		var saveNoteBtn = new sap.m.Button( {
				text: rs.getText('NoteSave'),
				tap: function(evt) 
				{	
					that.createNote();			       
				}
			});

		var cancelBtn = new sap.m.Button( {
				text: rs.getText('NoteCancel'),
				tap: function(evt) 
				{
					that.showNoteListPopover();				       
				}
			});

		this.noteTextArea = new sap.m.TextArea({
				placeholder : rs.getText('GetNote'),
				rows : 9,
			});	
			
		this.noteTextArea.addStyleClass('noteTextArea');

		var newNotePage = new sap.m.Page({
							enableScrolling: true,
							customHeader: new sap.m.Bar({
								contentLeft: [cancelBtn],
								contentMiddle: [new sap.m.Label({text: rs.getText('NewNote')})],
								contentRight:  [saveNoteBtn]
							}),
							content: [this.noteTextArea],
						});

		var that = this;
		this.newNotePopover = new sap.m.Popover({
			placement: sap.m.PlacementType.Left,
			showHeader: false,
			contentWidth: '400px',
			contentHeight: '300px',
			content: [newNotePage],
			afterOpen: function() {that.newNotePopover._isOpened = true;},
			afterClose: function(){that.newNotePopover._isOpened = false;}
		});	
		
		this.newNotePopover._isOpened = false;					
						
	},
		
	/**
	* this will create a new panel for oListPanel
	* @returns {sap.ui.commons.Panel}
	*/
	_initListNote:function()
	{

		this.itemTemplate = new sap.m.CustomListItem({
			content: new sap.ui.core.HTML({
						content: 
						{
							path: '/',
							formatter: function() 
							{
								var data = this.getBindingContext();
								var strDom = '<div class = "nodeItem">';
								strDom += '<div> <span>' + rs.getText('NoteBy') + '&nbsp </span>' + '<span class = "noteCreator">' + data.getProperty('CreatorName') + '</span>';
								strDom += '<span class = "noteDate">' +  data.getProperty('CreationDate').toLocaleDateString() + '</span></div>';
								strDom +=  '<div> <span>' + data.getProperty('Content') + '</span> </div>';
								strDom +=  '</div>';
								return strDom;
							}
						}
					}),
			type: "Inactive",
			tap: function(){/* do nothing */}
		});

		this.noteList = new sap.m.List({
			inset: false,
		});	
		
		this.noteList.addStyleClass("noteList");
	
		
		var listContainer = new sap.m.ScrollContainer({
			vertical: true,
			horizontal: false,
			width: '400px',
			//height: '300px',
			content: [this.noteList]
		});

		var that = this;
		var addNoteBtn = new sap.m.Button( {
			icon: './images/add.png',
			tap: function(evt) 
			{			
				that.showNewNodePopover();	       
			}
		});

		var listPage = new sap.m.Page({
							enableScrolling: true,
							customHeader: new sap.m.Bar({
								contentMiddle: [new sap.m.Label({text: rs.getText('Notes')})],
								contentRight:  [addNoteBtn]
							}),
							content: [listContainer],
						});

		var that = this;
		this.noteListPopover = new sap.m.Popover({
			placement: sap.m.PlacementType.Left,
			showHeader: false,
			contentWidth: '400px',
			contentHeight: '300px',
			content: [listPage],
			afterOpen: function() {that.noteListPopover._isOpened = true;},
			afterClose: function(){that.noteListPopover._isOpened = false;}
		});
		
		this.noteListPopover._isOpened = false;
		
	},
	
	isOpening:function()
	{
		var ret = false;
		if(this.noteListPopover._isOpened || this.newNotePopover._isOpened)
		{
			ret = true;
		}
		
		return ret;
	},

	
	bInited		: false,
	noteList	: null,
	itemTemplate : null,
	noteListPopover : null,		
	attachedObj : null,
	noteTextArea : null,
	hierId : null,
	byHierId : null,
	fiscalYear: null,
	hierGroup: {},
		
};