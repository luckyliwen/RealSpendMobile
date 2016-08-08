rs.view.HelpInfo = {

		showHelp : function(){
			var that = this;
			
			that.helpPopover = createHelpPopover();
			
			var viewId = rs.view.Help.getActiveView().getId();
			
			var element = sap.ui.getCore().byId(viewId +'--headerDataLeftOrOver');
			
	        that.helpPopover.openBy(element);

	        function createHelpPopover() {
	            var popover = {};
	            
	            if (!that.helpPopover) { // New an help popover
	              popover = new sap.m.Popover({
	                placement: sap.m.PlacementType.Left,
	    		    offsetY:318,
	    		    offsetX:50,
	                showHeader: false,
	              });
	              that.createHelpContent(popover, "500px");
	            } else {  // Return the exits help popover in memory but not open
	              popover = that.helpPopover;
	            }
	            
	            return popover;
	          }
			
		},

		  createHelpContent: function (helpContainor, contentWidth) {			    			    
			    
			    // SegmentedButton
			    var helpBtn = new sap.m.Button({
			      text: 'Help',
			      textAlign:"Center",
			      width: "50%",
			      tap: function (evt) { refreshScrollContainor('help'); }
			    });
			    var glossaryBtn = new sap.m.Button({
			      text: 'Glossary',
			      textAlign:"Center",
			      width: "50%",
			      tap: function (evt) { refreshScrollContainor('glossary'); }
			    });
			    var helpSegmentedBtn = new sap.m.SegmentedButton ({
			      width: contentWidth,
			      buttons: [helpBtn, glossaryBtn],
			      selectedButton: helpBtn,
			    }); 
			    var itemTemplate = new sap.m.CustomListItem({
			      content: new sap.ui.core.HTML({
			        content: {
			          path: '/',
			          formatter: function() {
			            var data = this.getBindingContext(),
			                contentTextWidth = data.getProperty('image') ? "90%" : "100%",
			                imgHtml = data.getProperty('image') ? '<div class="content-img"><img src="' + data.getProperty('image') + '" /> </div>' : '',
			                contextTextHtml = '<div style="display: inline-block;width:' + contentTextWidth + '">' + rs.getText(data.getProperty('content')) + '</div>';
			                
			            return '<h3>' + rs.getText(data.getProperty("title")) + '</h3>' + imgHtml + contextTextHtml;
			          }
			        }
			      })
			    }).addStyleClass('bg-white help-list-item');
			    var data = {
			      help: {
			        basics: [{
		    	          title: 'Title_UsingSAPRealSpend',
		    	          content: 'Content_UsingSAPRealSpend',
		    	          image: 'images/SAPLogo.png',
		    	        },{
		    	          title: 'Title_Alert',
		    	          content: 'Content_Alert',
		    	          image: 'images/LeftNavi_Alert_Button.png',
		    	        },{
		    	          title: 'Title_Calendar',
		    	          content: 'Content_Calendar',
		    	          image: 'images/RightNavi_TimeSelection_Button.png',
		    	        },{
		    	          title: 'Title_Share',
		    	          content: 'Content_Share',
		    	          image: 'images/RightNavi_Export_Button.png',
		    	        },{
		    	          title: 'Title_Setting',
		    	          content: 'Content_Setting',
		    	          image: 'images/RightNavi_Setting_Button.png',
		    	        },{
		    	          title: 'Title_HowToUseThisPage',
		    	          content: 'Content_HowToUseThisPage',
		    	          image: 'images/Help_FullPage_Header_Icon.png',
		    	        },{
		    	          title: 'Title_UsingTheTitleArea',
		    	          content: 'Content_UsingTheTitleArea',
		    	          image: 'images/Help_FullPage_TapHeader_Icon.png',
		    	        },{
		    	          title: 'Title_TreeMapView',
		    	          content: 'Content_TreeMapView',
		    	          image: 'images/OverviewTreeMapUnSelected.png',
		    	        },{
		    	          title: 'Title_TableView',
		    	          content: 'Content_TableView',
		    	          image: 'images/OverviewTableViewUnSelected.png',
		    	        },{
		    	          title: 'Title_SpendBudgetButton',
		    	          content: 'Content_SpendBudgetButton',
		    	          image: 'images/Help_SpendBudget_Icon.png',
		    	        },{
		    	          title: 'Title_UsingTheTreeMap',
		    	          content: 'Content_UsingTheTreeMap',
		    	          image: 'images/Help_TreeMap_TapOverlay_Icon.png',
		    	        },{
		    	          title: 'Title_Zoomingin',
		    	          content: 'Content_Zoomingin',
		    	          image: 'images/ZoomIn.png',
		    	        },{
		    	          title: 'Title_Zoomingout',
		    	          content: 'Content_Zoomingout',
		    	          image: 'images/ZoomOut.png',
		    	        },	    	        	    	      
		    	      ],
			        
		    	      glossary: [{
		    	          title: 'Title_Departments',
		    	          content: 'Content_Departments',
		    	          image: '',
		    	        },{
		    	          title: 'Title_ActualExpenses',
		    	          content: 'Content_ActualExpenses',
		    	          image: '',
		    	        },{
		    	          title: 'Title_CommittedExpenses',
		    	          content: 'Content_CommittedExpenses',
		    	          image: '',
		    	        },{
		    	          title: 'Title_Budget',
		    	          content: 'Content_Budget',
		    	          image: '',
		    	        },{
		    	          title: 'Title_YearToData',
		    	          content: 'Content_YearToData',
		    	          image: '',
		    	        },{
		    	          title: 'Title_AsOfDate',
		    	          content: 'Content_AsOfDate',
		    	          image: '',
		    	        }],
			        
			      },
			      			      
			    };
			    
			    var oModel = new sap.ui.model.json.JSONModel();
			    oModel.setData(data);
			    helpContainor.setModel(oModel);			    			    
			    
			    var scrollContainor = new sap.m.ScrollContainer({
			      width: contentWidth,
			      height: '600px',
			      horizontal: false, 
			      vertical: true, 
			    }).addStyleClass('bg-white');
			    

			    addBasicListToScrollContainor();
			    
			    helpContainor.removeAllContent();
			    helpContainor.addContent(helpSegmentedBtn).addContent(scrollContainor);
			    
			    function addBasicListToScrollContainor(){
			    	var basicsList = new sap.m.List({
					      headerText: 'The Basics', 
					    }).addStyleClass('help-list');
				    basicsList.bindItems('/help/basics', itemTemplate);
				    scrollContainor.addContent(basicsList);
			    }
			    
			    function refreshScrollContainor(type) {			      			      
			      
			      scrollContainor.destroyContent();
			      
			      if (type === 'help') {			    	  
			    	  addBasicListToScrollContainor();
			      }
			      else{
					    var glossaryList = new sap.m.List({
						      headerText : 'Overview - Department Spend'
						    }).addStyleClass('help-list');
					    glossaryList.bindItems('/help/glossary',itemTemplate);
			    	  scrollContainor.addContent(glossaryList);
			      }
			      			      
			    }
			  },
	      	      
		
};
