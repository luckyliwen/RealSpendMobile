/**
 * this will open the time period dialog
 */
rs.cfg.onTimePeriodClicked = function() {   
	if(this._oPopover == null){
		this._oPopover = new sap.m.Popover({
		    placement: sap.m.PlacementType.Left,
		    showHeader: false,
		    contentWidth:"400px",
		    contentHeight:"250px",
		    offsetY:290,
		    offsetX:50,
		  });
		  
		  this._carousel = new sap.m.NavContainer("myCarousel1", {
		    width: "400px",
		    height: "250px",
		    pages: [createTimePeriodPage(this), createOtherTimePeriodPage(this)]
		  });
		  this._oPopover.addContent(this._carousel);		
	}
  
	  var viewId = rs.view.Help.getActiveView().getId();
	  var element = sap.ui.getCore().byId(viewId +'--headerDataLeftOrOver');
	  this._oPopover.openBy(element);
 
	  this._timePeriod = rs.cfg.CfgValue.TimePeriod;
	  this._otherTimePeriod = rs.cfg.CfgValue.OtherTimePeriod;
	  this._tempOtherTimePeriod = rs.cfg.CfgValue.OtherTimePeriod;
	  this._detailTimePeriod = rs.cfg.CfgValue.DetailTime;
	  
	  this._carousel.backToTop();
	  	  
	  var items = this.oList.getItems();
	  if(rs.cfg.CfgValue.TimePeriod == rs.cfg.TimePeriod.Y2D){
	    items[0].setSelected(true);
	  } 
	  else if(rs.cfg.CfgValue.TimePeriod == rs.cfg.TimePeriod.Q2D){
	    items[1].setSelected(true);
	  } 
	  else if(rs.cfg.CfgValue.TimePeriod == rs.cfg.TimePeriod.M2D){
	    items[2].setSelected(true);
	  } 
	  else if(rs.cfg.CfgValue.TimePeriod == rs.cfg.TimePeriod.OTH){	    
	    items[3].setSelected(true);
	  }
  
};


createTimePeriodPage = function(obj){
    var that = this;
    var timePeriodPage = new sap.m.Page("timePeriodPage", {
      title : "Time Period",
      enableScrolling: false
    });
    
    obj.oList = new sap.m.List('timePeriod',{
      inset : true,
      mode : sap.m.ListMode.SingleSelect,
      select: function(){
        listSelect(this);
      }
    });
    
    var titleArr = ['YearToDate', 'QuarterToDate', 'MonthToDate', 'OtherTime'];
    for(var i = 0; i < 4; i++){
      var type = "Active";
      if(i == 3){
        type = "Navigation";
      }
      var item = new sap.m.InputListItem("inputList"+i,{
        label : rs.getText(titleArr[i]),
        type : type,
        tap: function() {
          inputListItemTap(this);
        }
      });
      obj.oList.addItem(item);
    }
    
    function listSelect(object) {
    	
      var items = object.getItems();
      
      for(var i = 0; i < items.length; i++){
    	  
        if(items[i].isSelected()){
          items[i].setSelected(true);
          
          if(i == items.length - 1){
            rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.OTH;
            obj._carousel.to("otherTimePeriodPage");
            that._setDefaulOtherTimePeriod();
          } 
          else {
            rs.cfg.CfgValue.OtherTimePeriod = rs.cfg.OtherTimePeriod.Period;
            
            that._tempOtherTimePeriod = rs.cfg.CfgValue.OtherTimePeriod;
            
            //if changed the time period setting
            if(i == 0 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.Y2D)){
                rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.Y2D;
                rs.cfg.CfgValue.save();
                rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent["TimePeriod"]]);              
            }             
            else if(i == 1 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.Q2D)){
              rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.Q2D;
              rs.cfg.CfgValue.save();
              rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent["TimePeriod"]]);
            } 
            else if(i == 2 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.M2D)) {
                rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.M2D;	//save the current setting
                rs.cfg.CfgValue.save();
                rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent["TimePeriod"]]);
              } 
            obj._oPopover.close();
          }
        }
      }
    }
    
    function inputListItemTap(object) {
      var items = obj.oList.getItems();
      
      for(var i = 0; i < items.length; i++){
    	  
        if(object === items[i]){
        	
          object.setSelected(true);
          if(i == items.length - 1){
            obj._carousel.to("otherTimePeriodPage");
            that._setDefaulOtherTimePeriod();
          } 
          else {
            rs.cfg.CfgValue.OtherTimePeriod = rs.cfg.OtherTimePeriod.Period;
            that._tempOtherTimePeriod = rs.cfg.CfgValue.OtherTimePeriod;
            
          //if changed the time period setting
            if(i == 0 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.Y2D)){
              rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.Y2D;	//save the setting
              rs.cfg.CfgValue.save();
              rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent.TimePeriod]);
            } 
            else if(i == 1 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.Q2D)){
              rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.Q2D;
              rs.cfg.CfgValue.save();
              rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent.TimePeriod]);
            } 
            else if(i == 2 && (rs.cfg.CfgValue.TimePeriod != rs.cfg.TimePeriod.M2D)){
              rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.M2D;
              rs.cfg.CfgValue.save();
              rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent.TimePeriod]);
            }
            obj._oPopover.close();
          }
        }
      }
    }
    
    timePeriodPage.addContent(obj.oList);
    return timePeriodPage;
  },

  createOtherTimePeriodPage = function(obj){
	    var self = this;
	    var otherTimePeriodPage = new sap.m.Page("otherTimePeriodPage",{
	      enableScrolling: false
	    });
	    
	    var bar = new sap.m.Bar({ 
	      contentLeft: [new sap.m.Button({
	        text: "Back", 
	        type: sap.m.ButtonType.Back,
	        tap: function(){
	         // $("#inputList3").find("img").attr("src","resources/sap/m/themes/sap_mvi/img/list/ios/disclosure_indicator_pressed.png");
	          obj._carousel.back();
	          otherTimePeriodPage.removeAllContent();
	        }
	      })],
	      
	      contentMiddle: [new sap.m.Label({text:rs.getText('OtherTime')})],
	      
	      contentRight: [new sap.m.Button({
	        text: "Done",
	        tap: function(){	          
	          if((self._timePeriod != rs.cfg.TimePeriod.OTH) || (self._otherTimePeriod != self._tempOtherTimePeriod) || (self._detailTimePeriod != rs.cfg.CfgValue.DetailTime)) {
	            rs.cfg.CfgValue.TimePeriod = rs.cfg.TimePeriod.OTH;
	            rs.cfg.CfgValue.OtherTimePeriod = self._tempOtherTimePeriod;
	            rs.cfg.CfgValue.save();
	            rs.cfg.Cfg.onCfgChanged([rs.cfg.ChangeEvent.TimePeriod]);
	          }
	          obj._carousel.back();
	          obj._oPopover.close();
	          obj._carousel.destroyPages();
	          obj._oPopover.destroyContent();
	          obj._oPopover = null;
	        }
	      })]
	    });
	    
	    var mButton = new sap.m.Button('mButton', {
	      type: sap.m.ButtonType.Default,
	      text: "{i18n>Monthly}",
	      enabled: true,
	      tap: function() {
	        btnTap(oSelect[0], rs.cfg.OtherTimePeriod.Period);
	      }
	    });
	    var qButton = new sap.m.Button('qButton', {
	      type: sap.m.ButtonType.Default,
	      text: "{i18n>Quarterly}",
	      enabled: true,
	      tap: function() {
	        btnTap(oSelect[1], rs.cfg.OtherTimePeriod.Quarter);
	      }
	    });
	    var yButton = new sap.m.Button('yButton', {
	      type: sap.m.ButtonType.Default,
	      text: "{i18n>Annual}",
	      enabled: true,
	      tap: function() {
	        btnTap(oSelect[2], rs.cfg.OtherTimePeriod.Year);
	      }
	    });
	    
	    var segmentedButton = new sap.m.SegmentedButton('segmentedBtn', {
	      buttons: [mButton,qButton,yButton],
	      width: "360px",
	      visible: true
	    });
	    segmentedButton.addStyleClass('segCont');
	    
	    function btnTap(object, otherPeriod){
	      self._tempOtherTimePeriod = otherPeriod;
	      
	      otherTimePeriodPage.removeAllContent();
	      otherTimePeriodPage.addContent(segmentedButton);
	      otherTimePeriodPage.addContent(object);
	      
	      if(self._tempOtherTimePeriod == rs.cfg.OtherTimePeriod.Year) {
	        rs.cfg.CfgValue.DetailTime = oSelect[2].getSelectedItem().getKey() + '';
	      } 
	      else if(self._tempOtherTimePeriod == rs.cfg.OtherTimePeriod.Quarter) {
	        rs.cfg.CfgValue.DetailTime = oSelect[1].getSelectedItem().getKey() + '';
	      } 
	      else {
	        rs.cfg.CfgValue.DetailTime = oSelect[0].getSelectedItem().getKey() + '';
	      }
	    }
	    
	    var monthItems = new Array();
	    var quarterItems = new Array();
	    var yearItems = new Array();
	    
	    var currentPeriod = rs.model.GeneralParam.getPeriod();
	    var fiscalYear     = rs.model.GeneralParam.getFiscalYear();
	    
	    //create month items
	    var monthKey = [];
	    var monthText = [];
	    
	    for (var i = 1;i<13;i++) {
		   key = rs.cfg.Month[ 'm' + i];
		   monthKey.push(key);
		   monthText.push(rs.util.Util.getMonthText(key)+" ");
	    }
	    	    	    	   
	    for(var i=0; i<12; i++){
	    	if(i<parseFloat(currentPeriod)){
	    		monthItems[i] = new sap.ui.core.Item({
	    							key: monthKey[i],
	    							text: monthText[i] + fiscalYear
	  	      });

	    	}
	    }
	    
	    
	    //create Quarter Items
		var currentQuarter = rs.util.Util.getCurrentQuarter();
	    var quarterKey = [rs.cfg.Quarter.Q1, rs.cfg.Quarter.Q2, rs.cfg.Quarter.Q3, rs.cfg.Quarter.Q4];
	    var quarterText = ["Q1", "Q2", "Q3", "Q4"];
	    for(var i = 0; i < 4; i++){
	    	if(i<(parseInt(currentQuarter/3,10)+1)){
	    		quarterItems[i] = new sap.ui.core.Item({
	    							key: quarterKey[i],
	    							text: rs.getText(quarterText[i]) + fiscalYear
			      });
	    		
	    	}
	    }
	    
	    //create Year items
	    var yearKey = [rs.cfg.Year.LastYear, rs.cfg.Year.ThisYear];
	    var yearText = ['LastFiscalYear', 'CurrentFiscalYear'];
	    for(var i = 0; i < 2; i++){
	      yearItems[i] = new sap.ui.core.Item({
	        key: yearKey[i],
	        text: rs.getText(yearText[i])
	      });
	    }
	    
	    var oItems = [monthItems,quarterItems,yearItems];
	    var oSelect = new Array();
	    for(var i = 0; i < 3; i++){
	      var select = new sap.m.Select({
	        items: oItems[i],
	        width: "350px",
	        selectedItem: oItems[i][0],
	        change: function(oControlEvent) {
	          rs.cfg.CfgValue.DetailTime = this.getSelectedItem().mProperties.key;
	        }
	      });
	      oSelect[i] =  select;
	    }
	    
	    //set select button
	    this._setDefaultButton = function(){
	      if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Year){
	        segmentedButton.setSelectedButton("yButton");
	      }
	      else if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Quarter){
	        segmentedButton.setSelectedButton("qButton");
	      }
	      else if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Period){
	        segmentedButton.setSelectedButton("mButton");
	      } 
	    }
	    
	    
	    otherTimePeriodPage.addContent(segmentedButton);
	    otherTimePeriodPage.setCustomHeader(bar);
	    
	    //set select default value
	    this._setDefaulOtherTimePeriod =  function(){
	      this._setDefaultButton();
	      
	      otherTimePeriodPage.addContent(segmentedButton);
	      
	      if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Year){
	        otherTimePeriodPage.addContent(oSelect[2]);
	        
	        if(rs.cfg.CfgValue.DetailTime == rs.cfg.Year.LastYear){
	          oSelect[2].setSelectedItem(yearItems[0]);
	        } 
	        else if(rs.cfg.CfgValue.DetailTime == rs.cfg.Year.ThisYear){
	          oSelect[2].setSelectedItem(yearItems[1]);
	        }
	      } 
	      else if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Quarter){
	        otherTimePeriodPage.addContent(oSelect[1]);
	        
	        for(var i = 0; i < quarterKey.length; i++){
	          if(rs.cfg.CfgValue.DetailTime == quarterKey[i]){
	            oSelect[1].setSelectedItem(quarterItems[i])
	          }
	        }
	      } 
	      else if(rs.cfg.CfgValue.OtherTimePeriod == rs.cfg.OtherTimePeriod.Period){
	        otherTimePeriodPage.addContent(oSelect[0]);
	        
	        for(var i = 0; i < 12; i++){
	          if(rs.cfg.CfgValue.DetailTime == monthKey[i]){
	            oSelect[0].setSelectedItem(monthItems[i]);
	          }
	        }
	      } 
	    };
	    
	    oSelect[0].addStyleClass('dropdown');//set select position to center
	    oSelect[1].addStyleClass('dropdown');
	    oSelect[2].addStyleClass('dropdown');
	    
	    return otherTimePeriodPage;
  },

  
rs.cfg.TimePeriods = {
		disable : function() {
			this._count++;
			$("#rs_calendar").mouseover(function () {
				$(this).css("cursor","not-allowed");
			});
			$('#rs_calendar').unbind('click');
		},
		enable : function(){
			this._count--;
			if(this._count == 0){
				this.reset();
			}
		},
		
		reset : function(){
			this._count = 0;
			$("#rs_calendar").mouseover(function () {
				$(this).css("cursor","pointer");
			});
			$('#rs_calendar').bind('click', $.proxy(rs.cfg.onTimePeriodClicked, rs.cfg));
		},
		_count : 0
};