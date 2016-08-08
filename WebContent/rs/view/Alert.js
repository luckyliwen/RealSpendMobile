rs.view.Alert = {

		showAlert : function(){

			  var _list = null,
		      _itemTemplate = null,
		      _modelInfo = null,		      
		      _alertPopover = null,
			  _isClose = true;
			  
			  var _createAlert = function(data) {
				    //mark all read button
				    var markAllBtn = new sap.m.Button( {
				      icon: './images/Alert_MarkasRead_Button.png',
				      tap: function(evt) {//TODO:				       
				    	  jQuery.sap.require("sap.m.MessageBox");
				    	  sap.m.MessageBox.show(
				    	      rs.getText("MarkAllAsRead"),
				    	      sap.m.MessageBox.Icon.QUESTION,
				    	      rs.getText("Question"),
				    	      [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				    	      function(oAction) {
				    	    	   if(oAction == sap.m.MessageBox.Action.YES){
										rs.model.Alert.markAllAsRead(_markAllAsReadSuccCB,_markAllAsReadFailCB,this);
				    	    	   }
			    	    		   _alertPopover.close();
				    	      }
				    		 );  				        
				      }
				    });
				    
				    _list = new sap.m.List({
				      //headerText: rs.getText('Your_alerts_for_the_past_30_days'),
				      inset: true,
				    });
				    
				    _itemTemplate = new sap.m.CustomListItem({
				      content: new sap.ui.core.HTML({
				        content: {
				          path: '/',
				          formatter: function() {
			        	    jQuery.sap.require("sap.ui.core.format.DateFormat");
   			        	    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd/MM/yyyy"}); //Returns a DateFormat instance for date and time				        	  

				            var data = this.getBindingContext();
				            var timeRange = data.getProperty('TimeRangeText');
				            if(timeRange != null && timeRange.length != 0) {
				              timeRange = ' - ' + timeRange + '  ';
				            };
				            var date = data.getProperty('CreationDate');
				            var dateFormat = oDateFormat.format(date);
				            var alertStatus = data.getProperty('Status');
				            var imageSrc = null;
				            if( alertStatus == rs.model.Alert.Status.UnRead)
						    {
				            	imageSrc= "<img src = 'images/Alert_blue_circle_icon.png' />";
						    }
						    else
						    {
						    	imageSrc = "";
						    }
				            return '<p class="line-one"><img src="images/Alert_budgetover_icon.png" /><span class="alert-title">'
				                   +' '+ data.getProperty('CCHierarchyName') + ' - ' + data.getProperty('CEHierarchyName') + timeRange + '</span></p>'				                   
				                   + '<p class="line-two">' + imageSrc + '<span class="alert-variance">' +' '+ data.getProperty('Percentage') + '% '
				                   + 'Over Budget' +'</span>'+ '<span class="alert-date">' + dateFormat + '</span></p>'
				          }
				        }
				      }),
				      type: 'Active',
				      tap: function() {//TODO:
				       var listIndex = _list.indexOfItem(this);
			           var itemData = _modelInfo.getSAPModel().oData[listIndex];				       						
						
						var alertID = itemData.AlertID;
						var ccHierId = itemData.CCHierarchyNodeID;
						var ioHierId =  itemData.IOHierarchyNodeID;
						
						rs.model.Alert.markAsRead(alertID,_markAsReadSuccCB,_markAsReadFailCB,this);					       
						
						var bus = sap.ui.getCore().getEventBus();
						bus.publish("main", "alertItemClicked", {
							ccHierId: ccHierId,
							ioHierId :ioHierId
						});					
				       _alertPopover.close();
				      }
				    });
				    
				    var listContainer = new sap.m.ScrollContainer({
				      vertical: true,
				      horizontal: false,
				      height: '550px',
				      width: '550px',
				      content: [_list]
				    });
				    
				    var alertHelpText = new sap.m.Label({text: rs.getText('Your_alerts_for_the_past_30_days')}).addStyleClass('alert-help');
				    
				    var alertPage = new sap.m.Page({
				      enableScrolling: false,
				      customHeader: new sap.m.Bar({
				        contentMiddle: [new sap.m.Label({text: rs.getText('Alerts')})],
				        contentRight:  [markAllBtn]
				      }),
				      content: [alertHelpText, listContainer],
				      
				    });
				    				    
				    //alert popover
				    _alertPopover = new sap.m.Popover({
				        placement: sap.m.PlacementType.Left,
				        offsetY: -52,
				        offsetX: 41,
				        contentWidth: '550px',
				        contentHeight: '550px',
				        //title: rs.getText('Alerts'),
				        showHeader: false,
				        //rightButton: markAllBtn,
				        content: [alertPage],
				        afterOpen: function() {
				          _isClose = false;
				        },
				        afterClose: function(){
				          _isClose = true;
				        }
				    });
				  };

			var _loadAlertDataSuccCB = function() {
						rs.util.Util.hideBusyIndicator();
					    
						_list.setModel(_modelInfo.getSAPModel());
					    
						_list.bindAggregation('items', '/', _itemTemplate);
						
						var viewId = rs.view.Help.getActiveView().getId();
						
						var element = sap.ui.getCore().byId(viewId +'--headerDataLeftOrOver');
					    _alertPopover.openBy(element );
					    
					    _list.bindAggregation('items', '/', _itemTemplate);
					  };
					  
			var _loadAlertDataFailCB = function() {
						rs.util.Util.hideBusyIndicator();
					    console.log('Load alert data failed!');
					  };

			var _markAsReadSuccCB = function(){			
						var obj = $('#rs_alert');
						var unreadCount = rs.model.Alert.getUnreadAlertCount();
						rs.util.Util.showBadge(obj, unreadCount); 		
					};
						
			var _markAsReadFailCB =function(error){
						rs.util.Util.showErrorMessage(null, error, null, null);
					};
						
			var _markAllAsReadSuccCB = function(){
						alert(rs.getText("MarkAllReadSucc"));
						var obj = $('#rs_alert');
						rs.util.Util.showBadge(obj, 0); 		
					};
						
			var _markAllAsReadFailCB = function(error){							
						rs.util.Util.showErrorMessage(null, error, null, null);							
					};
			

		    if(_alertPopover === null) {
		        _createAlert();
		      };
		      _modelInfo = rs.model.Alert.getLoadingModelInfo();
		      if(_isClose) {
		        if(_modelInfo.getLoadStatus() == rs.LoadStatus.NotStart) {
		          rs.model.Alert.loadData(_loadAlertDataSuccCB, _loadAlertDataFailCB, this);
		          rs.util.Util.showBusyIndicator();
		        } else if(_modelInfo.getLoadStatus() == rs.LoadStatus.Pending) {
		          rs.util.Util.showBusyIndicator();
		          console.log('alert pending');
		        } else if(_modelInfo.getLoadStatus() == rs.LoadStatus.Succ) {
		          _loadAlertDataSuccCB();
		        } else if(_modelInfo.getLoadStatus() == rs.LoadStatus.Fail) {
		          console.log('alert failed');
		        }
		      } else {
		        _alertPopover.close();
		      }
		
		},

};
