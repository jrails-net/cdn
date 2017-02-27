var $$ = Dom7;

//$$.ajaxSetup({
//    timeout : 1000
////    error: function (xhr, status) {
////    	console.log('error',status);
////    	xhr.abort();
////    	CNF.enable_network = false;
//////        if ( status === "timeout") {
////////            myApp.alert("No internet connection", 'Error!');
//////        	CNF.enable_network = false;
//////        }
////    }
//});

var CNF = {
	enable_network: false,
	defualt_no_poto_icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAhCAYAAACiGknfAAABM0lEQVRYR+1W0Q7DIAis/f9vrgvNaPAm7Tkl2RL2ssUhHMcBllpr3f7oUxJwcLWS4WCCt2Q4GQYGwiQh472UspxwF7AGjAr8bSYX4Flgs/fZBMIkwQIYtbsAi970WaHas8+M3pkG62m1d1fsMYYFLH6O4ziPrM/Gl74lfgGwl9AwYE1m3/eTIXzg4bmthvcbq+NVEyvbSEIzVCMpj4DpZa4B5NuzUVAWzF1yVgpuAlYSCNh2/oi+UdMjgHtVbKqEGkaxf5TkvQy8prKsMs074v8kcCVg1LYFo9V6Aoj/o+SosaZN5402ZuT15EVpFipKAfYce52OW8+bqXd+H+fw6MZZbc+udno1sw5XJoIxm6aLABThk2Z4JXMzvhLwDHvM3WSYYWnGJhmeYY+5mwwzLM3YvAA9grWq89SQUwAAAABJRU5ErkJggg==",
    username: ''		
};

var autoRefresh = false;
var autoRefreshHistory = false;
var DB;

document.addEventListener('pageInit', function (e) {
  page = e.detail.page;
  
  console.log('Create db');
  DB = openDatabase('AMS_DB', '1.0', 'AMS Local DB', 50 * 1024 * 1024);
  
  DB.transaction(function (tx) {  
//	   tx.executeSql('DROP TABLE discipline',[],function(tx,result){
//		   console.log("Drop table discipline for debug.");
//	   },function(ex,error){
//		  console.log(error.messages);
//	   });
//	   tx.executeSql('DROP TABLE odb_high_idle_power',[],function(tx,result){
//	      console.log("Drop table odb_high_idle_power for debug.");
//       },function(ex,error){
//	      console.log(error.messages);
//       });
	   var sql = "CREATE TABLE IF NOT EXISTS discipline (id unique,record_no unique,ocurrence_date,ocurrence_time,hkid,first_name,last_name,avl_no,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status)";
	   tx.executeSql(sql,[],function(tx,results){
		   console.log('Create table discipline if not exists.');
	   },function(tx,error){
		   console.log(error.message);
	   });	   
	   
	   var sql = "CREATE TABLE IF NOT EXISTS odb_high_idle_power (id,record_no,start_date,start_time,end_date,end_time,operator_code,aircraft_type_code,registration_mark,engine_made,engine_no,engine_power,result_code,company,engineer_permit_no,remarks,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status)";
	   tx.executeSql(sql,[],function(tx,results){
		   console.log('Create table odb_high_idle_power if not exists.');
	   },function(tx,error){
		   console.log(error.message);
	   });	
	   
  });

  
  setInterval(function(){
	  var screenH = $$(".view-main").height();
	  var navbarH = $$('.navbar').height() == null ? 0 : $$('.navbar').height();
	  var titleH = $$('.title').height() == null ? 0 : $$('.title').height();
	  var contentH = $$('.page-content').height();
	  var setH = screenH - navbarH - titleH;
	  $$('.page-content').css('height',(screenH - navbarH - titleH) + 'px');
	  $$('.page-content').css('overflow','auto');
	  $$('.page-content').css('-webkit-overflow-scrolling','touch');
  }, 500);
  
  

  var submit_discipline = function(){
		  DB.transaction(function (tx) {
			   tx.executeSql("SELECT * FROM discipline where status IN ('Creating') ORDER BY created_at ASC LIMIT 1", [], function (tx, results) {		  
			    	  var len = results.rows.length;
			    	  if(len > 0){
			    		  var row = results.rows.item(0);
			    		  var id = row.id;
			    		  var record_no = row.record_no;
			    		  var ocurrence_date = row.ocurrence_date;
			    		  var ocurrence_time = row.ocurrence_time;
			    		  var hkid = row.hkid;
			    		  var first_name = row.first_name;
			    		  var last_name = row.last_name;
			    		  var avl_no = row.avl_no;
			    		  var attachment = row.attachment;
			    		  var attachment_name = row.attachment_name;
			    		  var created_at = row.created_at;
			    		  console.log('submit_discipline',record_no);
			    		  $$.ajax({
			    			  url: '../connection.jsp' + '?' + new Date().getTime(),
			    			  method: 'POST',
			    			  timeout: 20000,
			    			  data: {record_no: record_no,ocurrence_date:ocurrence_date,ocurrence_time:ocurrence_time,
				    			  hkid:hkid,first_name:first_name,last_name:last_name,avl_no:avl_no,created_at:created_at,
				    			  attachment: attachment,attachment_name:attachment_name
				    		  },
			    			  success: function(data,code,request){
			    				  var sql = "UPDATE discipline SET status = 'Created' WHERE id = ?";
				    			  DB.transaction(function (tx) {
					    			  tx.executeSql(sql, [id],function(tx,result){
					    				  console.log("update discipline status is Created",id);
					    				  setTimeout(function(){
							    			  submit_discipline();
							    		  }, 1000);
					    			  },function(tx,error){
					    				  //For debug
					    				  console.log(error);
					    			  });
				    			  });
			    			  },
			    			  error: function(request,code){
			    				  CNF.enable_network = false;
			    			  }
			    		  });
			    		  
			    	  }else{
			    		  setTimeout(function(){
			    			  submit_discipline();
			    		  }, 5000);
			    	  }
			    	},function(ex,error){
			    		console.log(error);
			    });
			   
		  });
  };
  
  var submit_odb_high_idle_power = function(){
	  DB.transaction(function (tx) {
		   tx.executeSql("SELECT * FROM odb_high_idle_power where status IN ('Creating') ORDER BY created_at ASC LIMIT 1", [], function (tx, results) {		  
		    	  var len = results.rows.length;
		    	  if(len > 0){
		    		  var row = results.rows.item(0);
		    		  var id = row.id;
		    		  console.log('submit_odb_high_idle_power',row.record_no);
		    		  if(row.record_no === null){
		    			  alert(row.record_no);
		    		  }
		    		  $$.ajax({
		    			  url: '../submit_odb_high_idle_power.jsp' + '?' + new Date().getTime(),
		    			  method: 'POST',
		    			  timeout: 20000,
		    			  data: row,
		    			  success: function(data,code,request){
		    				  var sql = "UPDATE odb_high_idle_power SET status = 'Created' WHERE id = ?";
			    			  DB.transaction(function (tx) {
				    			  tx.executeSql(sql, [id],function(tx,result){
				    				  console.log("update odb_high_idle_power status is Created",id);
				    				  setTimeout(function(){
				    					  submit_odb_high_idle_power();
						    		  }, 1000);
				    			  },function(tx,error){
				    				  //For debug
				    				  console.log(error);
				    			  });
			    			  });
		    			  },
		    			  error: function(request,code){
		    				  CNF.enable_network = false;
		    			  }
		    		  });
		    		  
		    	  }else{
		    		  if(CNF.enable_network){
			    		  setTimeout(function(){
			    			  submit_odb_high_idle_power();
			    		  }, 5000);
		    		  }
		    	  }
		    	},function(ex,error){
		    		console.log(error);
		    });
		   
	  });
};

  setInterval(function(){
	  $$.ajax({
		  url: '../heartbeat.jsp' + '?' + new Date().getTime(),
		  method: 'GET',
		  timeout: 20000,
		  data: {test: new Date().getTime()},
		  success: function(data,code,request){
			  if(!CNF.enable_network){
			    CNF.enable_network = true;
//			    setTimeout(function(){
//			  	    submit_discipline();
//			  	}, 3000);
			    setTimeout(function(){
			    	submit_odb_high_idle_power();
				}, 3000);
			  }
		  },
		  error: function(request,code){
			  CNF.enable_network = false;
		  }
	  });
  },10000);
  


  
});

var doc = $$(document);
var myApp = new Framework7({});


var mainView = myApp.addView('#view-main', {
	 // dynamicNavbar: true
});

mainView.router.loadPage({url: 'login.html',animatePages: false});

myApp.onPageInit('login', function (page) {
	$$('#login .sing_in').on('click',function(){
		 var formData = myApp.formToJSON('#login-form');
		 console.log(formData);
		 var username = formData['username'];
		 var password = formData['password'];
		 if(username === '' || password === ''){
			 myApp.alert("","Please input your username and password.");
		 }else{
			 myApp.showPreloader();
			 setTimeout(function(){
				 if(username === 'cnt_tsl1' && password === 'password'){
					 CNF.username = username;
					 myApp.hidePreloader();
					 mainView.router.loadPage({url: 'index.html',animatePages: false});
				 } else if(username === 'cnt_tsl1' && password === 'delete'){
					  myApp.hidePreloader();
					  DB.transaction(function (tx) {  
						   tx.executeSql('DROP TABLE discipline',[],function(tx,result){
							   console.log("Drop table discipline for debug.");
						   },function(ex,error){
							  console.log(error.messages);
						   });
						   tx.executeSql('DROP TABLE odb_high_idle_power',[],function(tx,result){
						      console.log("Drop table odb_high_idle_power for debug.");
					       },function(ex,error){
						      console.log(error.messages);
					       });
						   var sql = "CREATE TABLE IF NOT EXISTS discipline (id unique,record_no unique,ocurrence_date,ocurrence_time,hkid,first_name,last_name,avl_no,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status)";
						   tx.executeSql(sql,[],function(tx,results){
							   console.log('Create table discipline if not exists.');
						   },function(tx,error){
							   console.log(error.message);
						   });	   
						   
						   var sql = "CREATE TABLE IF NOT EXISTS odb_high_idle_power (id,record_no,start_date,start_time,end_date,end_time,operator_code,aircraft_type_code,registration_mark,engine_made,engine_no,engine_power,result_code,company,engineer_permit_no,remarks,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status)";
						   tx.executeSql(sql,[],function(tx,results){
							   console.log('Create table odb_high_idle_power if not exists.');
						   },function(tx,error){
							   console.log(error.message);
						   });	
					  });
					  mainView.router.loadPage({url: 'index.html',animatePages: false});
				 }else{
					 myApp.hidePreloader();
					 myApp.alert("","Invalid username or password.");
				 }
			 },1000);	
		 }	 
	});
}); 

myApp.onPageInit('index', function (page) {
	//navmenu-tpl
	var template = $$('#navmenu-tpl').html();
	var compiledTemplate = Template7.compile(template);
	var context = {

	};
	var html = compiledTemplate(context);
	$$("#navmenu-view").html(html); 

	$$("#navmenu-view .acc").on('click',function(){
		myApp.showTab("#acc-view");
	});
	
	$$("#navmenu-view .airfield").on('click',function(){
		myApp.showTab("#airfield-view");
	});
	
	$$("#navmenu-view .discipline").on('click',function(){
		myApp.showTab("#discipline-view");
	});
	
	$$("#navmenu-view .survey").on('click',function(){
		myApp.showTab("#survey-view");
	});
	
	html = Template7.compile(survey_tpl)({});
	$$("#survey-view").html(html); 
	$$("#survey-view .catering").on('click',function(){
		$$("#cataring-form-view").html(catering_form_tpl);
		$$("#cataring-form-view .next").on('click',function(){
			html = Template7.compile(catering_item_tpl)({});
			$$("#cataring-item-view").html(html);
			$$("#cataring-item-view .yes_action").on('click',function(item){
		             var item_after = $$('.' + item.target.id);
                             var badge = "<span class='badge'>Yes</span>";
                             item_after.html(badge);
			});
			$$("#cataring-item-view .no_action").on('click',function(item){
		             var item_after = $$('.' + item.target.id);	
                             var badge = "<span class='badge'>No</span>";
                             item_after.html(badge);
			});
			$$("#cataring-item-view .na_action").on('click',function(item){
		             var item_after = $$('.' + item.target.id);	
                             var badge = "<span class='badge'>N/A</span>";
                             item_after.html(badge);
			});
			myApp.showTab("#cataring-item-view");
		});
		myApp.showTab("#cataring-form-view");
	}); 
	
	//acc-tpl
	template = $$('#acc-tpl').html();
	compiledTemplate = Template7.compile(template);
	context = {

	};
	html = compiledTemplate(context);
	$$("#acc-view").html(html); 
	
	//airfield-tpl
	template = $$('#airfield-tpl').html();
	compiledTemplate = Template7.compile(template);
	context = {

	};
	html = compiledTemplate(context);
	$$("#airfield-view").html(html); 
	$$("#airfield-view .high_power_engine_run_records .add_action").on('click',function(){
		console.log("high_power_engine_run_records add_action");
		template = $$('#high_power_engine_run_records-form-tpl').html();
		compiledTemplate = Template7.compile(template);
		context = {

		};
		html = compiledTemplate(context);
		var view = $$("#high_power_engine_run_records-form-view");
		view.html(html);
		
		var start_time;
		var start_date;
		var end_time;
		var end_date;
		var attachment_data = {};
		var attachment_icon = {};
		var record_no = view.find(".record_no")[0];
		var operator_code = view.find(".operator_code")[0];
		var aircraft_type_code = view.find(".aircraft_type_code")[0];
		var registration_mark = view.find(".registration_mark")[0];
		var engine_made = view.find(".engine_made")[0];
		var company = view.find(".company")[0];
		var engineer_permit_no = view.find(".engineer_permit_no")[0];
		var remarks = view.find(".remarks")[0];
		var engine_no = view.find(".engine_no")[0];
		var attachment = view.find('.attachment')[0];
		var reset = function(current_date){
			operator_code.value = '';
			aircraft_type_code.value = '';
			registration_mark.value = '';
			engine_made.value = '';
			company.value = '';
			attachment.value = '';
			view.find(".engineer_permit_no")[0].value = '';
			view.find('.remarks')[0].value = '';
			view.find('.engine_no select optgroup').html('');
			myApp.smartSelectAddOption(view.find('.engine_no select optgroup'), '<option value="01" >1</option>');
			myApp.smartSelectAddOption(view.find('.engine_no select optgroup'), '<option value="02" >2</option>');
			myApp.smartSelectAddOption(view.find('.engine_no select optgroup'), '<option value="03" >3</option>');
			myApp.smartSelectAddOption(view.find('.engine_no select optgroup'), '<option value="04" >4</option>');
			record_no.value = current_date.getTime();
			var default_time = eval(Sugar.Date.format(current_date,"['{hh}','{mm}']"));
			start_time = timePicker(view.find(".start_time")[0],default_time);
			start_date = myApp.calendar({
				dateFormat: 'yyyy-MM-dd',
				formatValue: function (p, values){
					var d = new Date(values[0]);
					return Sugar.Date.format(d,"{yyyy}-{MM}-{dd}");
				},
			    input: view.find('.end_date')[0]
			});  
			start_date.setValue([current_date.getTime()]);
			end_time = timePicker(view.find('.end_time')[0],default_time);
			end_date = myApp.calendar({
				dateFormat: 'yyyy-MM-dd',
				formatValue: function (p, values){
					var d = new Date(values[0]);
					return Sugar.Date.format(d,"{yyyy}-{MM}-{dd}");
				},
			    input: view.find('.start_date')[0]
			});  
			end_date.setValue([current_date.getTime()]);
			operatorPicker(view.find('.operator_type',[''])[0]);
			acTypePicker(view.find('.aircraft_type_code',[''])[0]);
			resultPicker(view.find('.result_code')[0],['SUCCESS']);
			$$(view.find('.attachment')[0]).on('change',function(){
				var me = this;
				var zoom = 1;
				var picker = imageSizePicker(function(p){
					if(p.value[0] === 'Original Image'){
						zoom = 1.0;
					}else if(p.value[0] === 'Small Image'){
						zoom = 0.5;
					}else{
						zoom = 1.0;
					}
					getImageOfZoom(me.files[0],zoom,function(f){
						attachment_data = f; 
					});
					getImageOfWidth(me.files[0],44.0,function(f){
						attachment_icon = f; 
					});
				});
				picker.open();
				return;
			});
		};
		reset(new Date());
		myApp.showTab(view);
		
		view.find('.save').on('click',function(){
			  myApp.showPreloader();
			  var current_date = new Date();
			  var formData = myApp.formToJSON(view.find('.input-form')[0]);
			  var record_no_v = formData['record_no'];
			  var start_time_v = formData['start_time'];
			  var start_date_v = start_date.value[0];
			  var end_time_v = formData['end_time'];
		      var end_date_v = end_date.value[0];
			  var attachment_v = attachment_data.data;
			  var attachment_name = attachment_data.name;
			  var icon = attachment_icon.data;
			  var operator_code_v = formData['operator_code'];
			  var aircraft_type_code_v = formData['.aircraft_type_code'];
			  var registration_mark_v = formData['registration_mark'];
			  var engine_made_v = formData['engine_made'];
			  var company_v = formData['company'];
			  var engineer_permit_no_v = formData['engineer_permit_no'];
			  var remarks_v = formData['remarks'];
			  var engine_no_v = formData['engine_no'];
			  var result_code_v = formData['result_code'];
			  var engine_power_v = formData['engine_power'];
			  var created_at = current_date.getTime();
			  var updated_at = null;
			  var created_user_id = CNF.username;
			  var updated_user_id = null;
			  var status = 'Creating';
			  var id = record_no_v;
			  console.log(attachment_v);
			  setTimeout(function(){
				  var sql = 'INSERT INTO odb_high_idle_power (id,record_no,start_date,start_time,end_date,end_time,operator_code,aircraft_type_code,registration_mark,engine_made,engine_no,engine_power,result_code,company,engineer_permit_no,remarks,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
				  DB.transaction(function (tx) {  
					   tx.executeSql(sql,[id,record_no_v,start_date_v,start_time_v,end_date_v,end_time_v,
					                      operator_code_v,aircraft_type_code_v,registration_mark_v,engine_made_v,
					                      engine_no_v,engine_power_v,result_code_v,company_v,engineer_permit_no_v,
					                      remarks_v,attachment_v,attachment_name,icon,
					                      created_at,updated_at,created_user_id,updated_user_id,status],
						function(tx,results){
						   myApp.alert('','Saved',function(){
							   reset(new Date());
						   });
						   myApp.hidePreloader();
					   },function(rx,error){
						   console.log(error);
						   myApp.hidePreloader();
					   }	   
					   );
				  });
			  },1000);
		});
	});
	$$("#airfield-view .high_power_engine_run_records .search_action").on('click',function(){
		template = $$('#high_power_engine_run_records-list-tpl').html();
		compiledTemplate = Template7.compile(template);
		context = {

		};
		html = compiledTemplate(context);
		$$("#high_power_engine_run_records-list-view").html(html);
		higePowerEngineRunRecordsRefresh();
		myApp.showTab('#high_power_engine_run_records-list-view');
		var mySearchbar = myApp.searchbar('#high_power_engine_run_records-list-view .searchbar', {
		    searchList: '.list-block-search',
		    searchIn: '.item-title, .item-subtitle',
//		    customSearch: true,
//		    onSearch: function(s){
//		    	if(!s.searchLock){
//		    		s.searchLock = true;
//			    	setTimeout(function(){
//			    		if(s.beforeValue !== s.value){
//			    			console.log(s.beforeValue,s.value);
//			    			s.beforeValue = s.value;
//			    		}
//			    		s.searchLock = false;
//			    	},2000);
//		    	}
//		    }
		});
	});
	
	$$("#airfield-view .high_power_engine_run_records .search_action_for_remote").on('click',function(){
		template = $$('#high_power_engine_run_records-list-tpl').html();
		compiledTemplate = Template7.compile(template);
		context = {

		};
		html = compiledTemplate(context);
		$$("#high_power_engine_run_records-list-view").html(html);
		myApp.showTab('#high_power_engine_run_records-list-view');
		var mySearchbar = myApp.searchbar('#high_power_engine_run_records-list-view .searchbar', {
		    searchList: '.list-block-search',
		    searchIn: '.item-title, .item-subtitle',
		    customSearch: true,
		    onSearch: function(s){
		    	if(!s.searchLock){
		    		s.searchLock = true;
			    	setTimeout(function(){
//			    		var garp = new Date().getTime() - mySearchbar.lastChangedAt;
//			    		console.log(garp);
			    		if(s.beforeValue !== s.value){
			    			var ptrContent = $$('#high_power_engine_run_records-list-view .pull-to-refresh-content');
			    			myApp.pullToRefreshTrigger(ptrContent);
			    			s.beforeValue = s.value;
			    		}
			    		s.searchLock = false;
			    	},2000);
		    	}
		    }
		});
//		$$(mySearchbar.container.find('input')[0]).on('keyup',function(s){
//			mySearchbar.lastChangedAt = new Date().getTime();
//		});
		higePowerEngineRunRecordsRefreshForRemote(mySearchbar);
	});
	
	//discipline-tpl
	template = $$('#discipline-tpl').html();
	compiledTemplate = Template7.compile(template);
	context = {

	};
	html = compiledTemplate(context);
	$$("#discipline-view").html(html);
	$$('.add_discipline').on('click', function () {
		   
			var template = $$('#discipline-form-tpl').html();
			var compiledTemplate = Template7.compile(template);
			var context = {

			};
			var html = compiledTemplate(context);
			$$("#discipline-form-view").html(html);
			var ocu_date;
			var attachment_data = {};
			var attachment_icon = {};
			var reset = function(current_date){
				var rec = $$("#discipline-form-view .record_no")[0];
				$$("#discipline-form-view .hkid")[0].value = '';
				$$("#discipline-form-view .first_name")[0].value = '';
				$$("#discipline-form-view .last_name")[0].value = '';
				$$("#discipline-form-view .avl_no")[0].value = '';
				$$("#discipline-form-view .attachment")[0].value = '';
				rec.value = current_date.getTime();
				myApp.showTab('#discipline-form-view');
				ocu_date = myApp.calendar({
					dateFormat: 'yyyy-MM-dd',
					formatValue: function (p, values){
						var d = new Date(values[0]);
						return Sugar.Date.format(d,"{yyyy}-{MM}-{dd}");
					},
				    input: '#discipline-form-view .ocurrence_date'
				});
				ocu_date.setValue([current_date.getTime()]);			
				var default_time = eval(Sugar.Date.format(current_date,"['{hh}','{mm}']"));
				var ocu_time = timePicker("#discipline-form-view .ocurrence_time",default_time);
				
				$$('#discipline-form-view .attachment').on('change',function(){
					var me = this;
					var zoom = 1;
					var picker = imageSizePicker(function(p){
						if(p.value[0] === 'Original Image'){
							zoom = 0.5;
						}else if(p.value[0] === 'Small Image'){
							zoom = 1.0;
						}else{
							zoom = 1.0;
						}
						getImageOfZoom(me.files[0],zoom,function(f){
							attachment_data = f; 
						});
						getImageOfWidth(me.files[0],44.0,function(f){
							attachment_icon = f; 
						});
					});
					picker.open();
					return;
				});
			}
			var current_date = new Date();
			reset(current_date);
			$$('#discipline .save').on('click',function(){
				  myApp.showPreloader();
				  var formData = myApp.formToJSON('#input-form');
				  var id = formData['record_no'];
				  var record_no = formData['record_no'];
				  var ocurrence_date = ocu_date.value[0];
				  var ocurrence_time = formData['ocurrence_time'];
				  var hkid = formData['hkid'];
				  var first_name = formData['first_name'];
				  var last_name = formData['last_name'];
				  var avl_no = formData['avl_no'];
				  var attachment = attachment_data.data;
				  var attachment_name = attachment_data.name;
				  var icon = attachment_icon.data;
				  var created_at = current_date.getTime();
				  var updated_at = null;
				  var created_user_id = null;
				  var updated_user_id = null;
				  var status = 'Creating';
				  setTimeout(function(){
					  var sql = 'INSERT INTO discipline (id,record_no,ocurrence_date,ocurrence_time,hkid,first_name,last_name,avl_no,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					  DB.transaction(function (tx) {  
						   tx.executeSql(sql,[id,record_no,ocurrence_date,ocurrence_time,hkid,first_name,last_name,avl_no,attachment,attachment_name,icon,created_at,updated_at,created_user_id,updated_user_id,status],
							function(tx,results){
							   myApp.alert('','Saved',function(){
//								   mainView.router.back({pageName: '#discipline-form-view'});
								   //myApp.showTab('#discipline-form-view');
								   reset(new Date());
							   });
							   myApp.hidePreloader();
						   },function(rx,error){
							   console.log(error);
							   myApp.hidePreloader();
						   }	   
						   );
					  });
				  },1000);
			  });
	});
	$$('.search_discipline').on('click', function () {
		var template = $$('#discipline-list-tpl').html();
		var compiledTemplate = Template7.compile(template);
		var context = {

		};
		var html = compiledTemplate(context);
		$$("#discipline-list-view").html(html);
		myApp.showTab('#discipline-list-view');

		disciplineRefresh();
	});  
	

}); 

function disciplineRefresh(){
	  var ptrContent = $$('#discipline-list-view .pull-to-refresh-content');
	  myApp.initPullToRefresh(ptrContent);
	 
	  ptrContent.on('refresh', function (e) {
		 setTimeout(disciplineLoad(ptrContent),300);
	  });	
	  
	  myApp.pullToRefreshTrigger(ptrContent);
}

function higePowerEngineRunRecordsRefresh(){
    // Pull to refresh content
  var ptrContent = $$('#high_power_engine_run_records-list-view .pull-to-refresh-content');
  myApp.initPullToRefresh(ptrContent);
  ptrContent.on('refresh', function (e) {
	 setTimeout(higePowerEngineRunRecordsLoad(ptrContent),300);
  });	
  myApp.pullToRefreshTrigger(ptrContent);
}

function higePowerEngineRunRecordsRefreshForRemote(search){
    // Pull to refresh content
  var ptrContent = $$('#high_power_engine_run_records-list-view .pull-to-refresh-content');
  myApp.initPullToRefresh(ptrContent);
  ptrContent.on('refresh', function (e) {
	 setTimeout(function(){
		 higePowerEngineRunRecordsLoadForRemote(ptrContent,search)
	 },300);
  });	
  myApp.pullToRefreshTrigger(ptrContent);
}

function higePowerEngineRunRecordsLoadForRemote(ptrContent,search){
	console.log('ptrContent,',search.value);
	var template = $$('#high_power_engine_run_records-loop-tpl').html();
	var compiledTemplate = Template7.compile(template);
    var list = [];
    var url = '../search_high_power_engine_run_records.jsp?' + new Date().getTime(); 
    $$.ajax({
    	url: url,
    	method: 'POST',
    	timeout: 20000,
    	data: {query:(search.value === null ? '' : search.value),user_id: ''},
    	success: function(data,code,request){
    		var results = eval('(' + data + ')');
    		console.log(results);
    		var len = results.data.length, i;
    	    for (i = 0; i < len; i++) {
    	      var row = results.data[i];
    	      list[i] = row;
    	      if(row.icon === 'undefined' || row.icon === undefined || row.icon === null || row.icon === ''){
    	    	  row.icon = CNF.defualt_no_poto_icon;
    	      }
    	      list[i] = row;
    	    }
    	    var context = {
					list: list
			};
		    var itemHTML = compiledTemplate(context);
			ptrContent.find('ul').html(itemHTML);
    		myApp.pullToRefreshDone();
    	},
    	error: function(request,code){
    		console.log('higePowerEngineRunRecordsLoadForRemote',code);
    		myApp.pullToRefreshDone();
    	}
    });
}

function higePowerEngineRunRecordsLoad(ptrContent){
	var template = $$('#high_power_engine_run_records-loop-tpl').html();
	var compiledTemplate = Template7.compile(template);
    var list = [];
    DB.transaction(function (tx) {  
      tx.executeSql("SELECT id,record_no,engineer_permit_no,status,IFNULL(icon,'" + CNF.defualt_no_poto_icon + "') AS icon FROM odb_high_idle_power ORDER BY created_at DESC", [], function (tx, results) {		  
    	    var len = results.rows.length, i;
    	    for (i = 0; i < len; i++) {
    	      var row = results.rows.item(i);
    	      list[i] = row; 
    	    }
    	    var context = {
					list: list
			};
		    var itemHTML = compiledTemplate(context);
			ptrContent.find('ul').html(itemHTML);
			myApp.pullToRefreshDone();
    	},function(ex,error){
    		console.log(error);
    	}
     );
   });
}

function disciplineLoad(ptrContent){
	var template = $$('#discipline-loop-tpl').html();
	var compiledTemplate = Template7.compile(template);
    var list = [];
    DB.transaction(function (tx) {  
      tx.executeSql('SELECT id,record_no,hkid,status,icon FROM discipline ORDER BY created_at DESC', [], function (tx, results) {		  
    	    var len = results.rows.length, i;
    	    for (i = 0; i < len; i++) {
    	      var row = results.rows.item(i);
    	      console.log(row.status === 'Created');
    	      var bg_color = row.status === 'Created' ? 'bg_red' : 'bg_green';
    	      row['bg_color'] = bg_color;
    	      list[i] = row;
    	    }
  	        var context = {
					list: list
				};
			var itemHTML = compiledTemplate(context);
			ptrContent.find('ul').html(itemHTML);
			myApp.pullToRefreshDone();
    	},function(ex,error){
    		console.log(error);
    	}
     );
   });
}

var timePickers = [
 {
     textAlign: 'left',
     values: ('00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23').split(' ')
 },
 {
     values: ('00 01 02 03 04 05 06 07 08 09 10 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59').split(' ')
 }
];

function timePicker(inputSelector,defaultValues){
	var pickerDescribe = myApp.picker({
	    input: inputSelector,
	    rotateEffect: true,
	    cols: timePickers,
	    value: defaultValues,
	    formatValue: function (p, values, displayValues){
	    	return values[0] + '' + values[1];
	    },
	    toolbarTemplate: 
	        '<div class="toolbar">' +
	            '<div class="toolbar-inner">' +
	                '<div class="left">' +
	                    '<a href="#" class="link toolbar-randomize-link">Time</a>' +
	                '</div>' +
	                '<div class="right">' +
	                    '<a href="#" class="link close-picker">Done</a>' +
	                '</div>' +
	            '</div>' +
	        '</div>',
	}); 
	return pickerDescribe;
}

function operatorPicker(inputSelector,defaultValues){
	return pickerDescribe = myApp.picker({
	    input: inputSelector,
	    rotateEffect: true,
	    value: defaultValues,
	    cols: [
	        {
	            textAlign: 'left',
	            values: ['Air China','Air Hong Kong','Air Canada','Air France']
	        }
	    ]
	});  
}

function resultPicker(inputSelector,defaultValues){
	return pickerDescribe = myApp.picker({
	    input: inputSelector,
	    rotateEffect: true,
	    value: defaultValues,
	    cols: [
	        {
	            textAlign: 'left',
	            values: ['SUCCESS','UNSUCCESS']
	        }
	    ]
	});  
}

function acTypePicker(inputSelector,defaultValues){
	return pickerDescribe = myApp.picker({
	    input: inputSelector,
	    rotateEffect: true,
	    value: defaultValues,
	    cols: [
	        {
	            textAlign: 'left',
	            values: ['369','A310','B707']
	        }
	    ]
	});  
}

function imageSizePicker(callback){
	var pickerDescribe = myApp.picker({
	    rotateEffect: true,
	    onClose: function (picker) {
	    	callback(picker);
	    },
	    cols: [
	        {
	            textAlign: 'left',
	            values: ['Original Image','Small Image']
	        }
	    ]
	}); 
	return pickerDescribe;
}

function getImageOfZoom(imageFile,zoom,chagneCallback) {
	  var reader = new FileReader();
	  reader.onload = function(event) {
	    the_url = event.target.result
	    var image = new Image();
	    image.onload = function() {
	      var canvas=document.createElement("canvas");
	      var ctx=canvas.getContext("2d");
	      canvas.width=image.width*zoom;
	      canvas.height=image.height*zoom;
	      ctx.drawImage(image,0,0,image.width,image.height,0,0,canvas.width,canvas.height);
	  
	      chagneCallback({name: imageFile.name,
	                      size:imageFile.size,
	                      type: imageFile.type,
	                      width:canvas.width,
	                      height: canvas.height,
	                      data: canvas.toDataURL()});
	    };
	    image.src = the_url;
	  }
	  reader.readAsDataURL(imageFile);
	}

	function getImageOfWidth(imageFile,targetWidth,chagneCallback) {
	  var reader = new FileReader();
	  reader.onload = function(event) {
	    the_url = event.target.result
	    var image = new Image();
	    image.onload = function() {
	      var canvas=document.createElement("canvas");
	      var ctx=canvas.getContext("2d");
	      var zoom = targetWidth/image.width;
	      console.log("zoom",zoom);
	      canvas.width=image.width*zoom;
	      canvas.height=image.height*zoom;
	      ctx.drawImage(image,0,0,image.width,image.height,0,0,canvas.width,canvas.height);
	      chagneCallback({name: imageFile.name,
	                      size:imageFile.size,
	                      type: imageFile.type,
	                      width:canvas.width,
	                      height: canvas.height,
	                      data: canvas.toDataURL()});
	    };
	    image.src = the_url;
	  }
	  reader.readAsDataURL(imageFile);
	}

myApp.init();

function post(url,data){
  var result;
  $$.ajax({
    url: url + '?' + new Date().getTime(),
    method: 'POST',
//    timeout: 20000,
    async: false,
    data: data,
    success: function(data,code,request){
      console.log("[debug] function get",code + ' ' +url);
	  result = data;
	},
	error: function(request,code){
		console.log("[error] function get",code + ' ' + url);
		reuslt = null;
	}
  });
  return result;
}

function get(url,data){
  var result = null;
  $$.ajax({
    url: url + '?' + new Date().getTime(),
    method: 'GET',
   // timeout: 20000,
    async: false,
    data: data,
    success: function(data,code,request){
	  console.log("[debug] function get",code + ' ' + url);
	  result = data;
	},
	error: function(request,code){
	  console.log("[error] function get",code + ' ' + url);
	  console.log(data);
	  reuslt = null;
	}
  });
  return result;
}
function catering_click(id){
  alert(id);
}
