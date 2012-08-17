$(function(){function e(e,t){var n=e.find(".terminator a.btn");n.html(n.html().replace(/\[ .+ \]/,"[ "+t+" ]")),e.find(".terminator").data("statement_separator",t)}var t=Backbone.Router.extend({routes:{"!:db_type_id":"DBType","!:db_type_id/:short_code":"SchemaDef","!:db_type_id/:short_code/:query_id":"Query","!:db_type_id/:short_code/:query_id/:set_id":"SetAnchor"},DBType:function(e){window.dbTypes.setSelectedType(e,!0),window.dbTypesListView.render()},SchemaDef:function(e,t){this.loadContent(e,"!"+e+"/"+t)},Query:function(e,t,n){this.loadContent(e,"!"+e+"/"+t+"/"+n)},SetAnchor:function(e,t,n,r){var i=function(){$("#set_"+r).length&&(window.scrollTo(0,$("#set_"+r).offset().top-50),$("#set_"+r).addClass("highlight"))};!window.dbTypes.getSelectedType()||window.dbTypes.getSelectedType().get("id")!=e||window.schemaDef.get("short_code")!=t||window.query.get("id")!=n?(window.query.bind("reloaded",_.once(i)),this.loadContent(e,"!"+e+"/"+t+"/"+n)):($(".set").removeClass("highlight"),i())},loadContent:function(t,r){this.DBType(t);if(window.query.get("pendingChanges")&&!confirm("Warning! You have made changes to your query which will be lost. Continue?'"))return!1;window.schemaDef.set("loading",!0),$(".helpTip").css("display","none"),$("body").block({message:"Loading..."}),$.getJSON("index.cfm/fiddles/loadContent",{fragment:r},function(r){window.schemaDef.set("loading",!1);if(r.short_code){var i=window.dbTypes.getSelectedType();i.get("context")=="browser"?(i.get("className")=="sqljs"&&window.browserEngines.websql.nativeSQLite&&confirm("Fiddle originally built with SQL.js, but you have WebSQL available - would you like to use that instead (it'll be faster to load)?")&&(window.dbTypes.setSelectedType($("#db_type_id a:contains('WebSQL')").closest("li").attr("db_type_id")),i=window.dbTypes.getSelectedType(),window.schemaDef.set({ddl:r.ddl,dbType:i,statement_separator:r.schema_statement_separator}),r.sql&&(window.query.set({schemaDef:window.schemaDef,sql:r.sql,statement_separator:r.query_statement_separator}),window.schemaDef.on("built",_.once(function(){window.query.execute()}))),window.schemaDef.build()),window.browserEngines[i.get("className")].buildSchema({short_code:$.trim(r.short_code),statement_separator:r.schema_statement_separator,ddl:r.ddl,success:function(){window.schemaDef.set({short_code:r.short_code,ddl:r.ddl,ready:!0,valid:!0,errorMessage:"",statement_separator:r.schema_statement_separator,dbType:window.dbTypes.getSelectedType()}),e($(".panel.schema"),r.schema_statement_separator),r.sql?(window.myFiddleHistory.insert(new n({fragment:"!"+t+"/"+r.short_code+"/"+r.id})),window.query.set({id:r.id,sql:r.sql,statement_separator:r.query_statement_separator})):window.myFiddleHistory.insert(new n({fragment:"!"+t+"/"+r.short_code})),window.browserEngines[i.get("className")].getSchemaStructure({callback:function(e){window.schemaDef.set({schema_structure:e}),window.schemaDef.trigger("reloaded"),r.sql?window.browserEngines[i.get("className")].executeQuery({sql:r.sql,statement_separator:r.query_statement_separator,success:function(e){window.query.set({sets:e}),window.query.trigger("reloaded"),$("body").unblock()},error:function(e){window.query.set({sets:[]}),window.query.trigger("reloaded"),$("body").unblock()}}):$("body").unblock()}})},error:function(t){window.schemaDef.set({short_code:r.short_code,ddl:r.ddl,ready:!0,valid:!1,errorMessage:t,dbType:window.dbTypes.getSelectedType(),statement_separator:r.schema_statement_separator,schema_structure:[]}),e($(".panel.schema"),r.schema_statement_separator),r.sql&&(window.query.set({id:r.id,sql:r.sql,statement_separator:r.query_statement_separator,schemaDef:window.schemaDef}),window.query.trigger("reloaded")),window.schemaDef.trigger("failed"),window.schemaDef.trigger("reloaded"),$("body").unblock()}})):(window.schemaDef.set({short_code:r.short_code,ddl:r.ddl,ready:!0,valid:!0,errorMessage:"",statement_separator:r.schema_statement_separator,schema_structure:r.schema_structure}),e($(".panel.schema"),r.schema_statement_separator),window.schemaDef.trigger("reloaded"),r.sql?(window.myFiddleHistory.insert(new n({fragment:"!"+t+"/"+r.short_code+"/"+r.id})),window.query.set({id:r.id,sql:r.sql,sets:r.sets,statement_separator:r.query_statement_separator}),window.query.trigger("reloaded")):window.myFiddleHistory.insert(new n({fragment:"!"+t+"/"+r.short_code})),$("body").unblock())}else $("body").unblock()})}}),n=Backbone.Model.extend({defaults:{fragment:"",full_name:"",ddl:"",sql:""},initialize:function(){this.set("last_used",new Date)}}),r=Backbone.Collection.extend({model:n,comparator:function(e,t){return e.get("last_used")==t.get("last_used")?0:e.get("last_used")>t.get("last_used")?-1:1},insert:function(e){if(!$("#user_choices",this).length){var t=this.find(function(t){return t.get("fragment")==e.get("fragment")});t?(t.set("last_used",e.get("last_used")),this.sort()):this.add(e),this.trigger("change")}},initialize:function(){try{if(localStorage){var e=localStorage.getItem("fiddleHistory");e&&e.length&&this.add($.parseJSON(e))}}catch(t){}}}),i=Backbone.Model.extend({defaults:{sample_fragment:"",notes:"",simple_name:"",full_name:"",selected:!1,context:"host",className:""}}),s=Backbone.Collection.extend({model:i,getSelectedType:function(){var e=this.filter(function(e){return e.get("selected")});return e.length?e[0]:!1},setSelectedType:function(e,t){this.each(function(t){t.set({selected:t.id==e},{silent:!0})}),t||this.trigger("change")}}),o=Backbone.Model.extend({defaults:{ddl:"",short_code:"",simple_name:"",full_name:"",valid:!0,errorMessage:"",loading:!1,ready:!1,schema_structure:[],statement_separator:";"},reset:function(){this.set(this.defaults),this.trigger("reloaded")},build:function(){var e=window.dbTypes.getSelectedType(),t=this;if(!e)return!1;(!this.has("dbType")||this.get("dbType").id!=e.id)&&this.set("dbType",e),$.ajax({type:"POST",url:"index.cfm/fiddles/createSchema",data:{statement_separator:this.get("statement_separator"),db_type_id:this.get("dbType").id,schema_ddl:this.get("ddl")},dataType:"json",success:function(n,r,i){n.short_code?e.get("context")=="browser"?window.browserEngines[e.get("className")].buildSchema({short_code:$.trim(n.short_code),statement_separator:t.get("statement_separator"),ddl:t.get("ddl"),success:function(){t.set({short_code:$.trim(n.short_code),ready:!0,valid:!0,errorMessage:""}),window.browserEngines[e.get("className")].getSchemaStructure({callback:function(e){t.set({schema_structure:e}),t.trigger("built")}})},error:function(e){t.set({short_code:$.trim(n.short_code),ready:!1,valid:!1,errorMessage:e,schema_structure:[]}),t.trigger("failed")}}):(t.set({short_code:$.trim(n.short_code),ready:!0,valid:!0,errorMessage:"",schema_structure:n.schema_structure}),t.trigger("built")):(t.set({short_code:"",ready:!1,valid:!1,errorMessage:n.error,schema_structure:[]}),t.trigger("failed"))},error:function(e,n,r){t.set({short_code:"",ready:!1,valid:!1,errorMessage:r,schema_structure:[]}),t.trigger("failed")}})}}),u=Backbone.Model.extend({defaults:{id:0,sql:"",sets:[],pendingChanges:!1,statement_separator:";"},reset:function(){this.set(this.defaults),this.trigger("reloaded")},execute:function(){var e=this;if(!this.has("schemaDef")||!this.get("schemaDef").has("dbType")||!this.get("schemaDef").get("ready"))return!1;$.ajax({type:"POST",url:"index.cfm/fiddles/runQuery",data:{db_type_id:this.get("schemaDef").get("dbType").id,schema_short_code:this.get("schemaDef").get("short_code"),statement_separator:this.get("statement_separator"),sql:this.get("sql")},dataType:"json",success:function(t,n,r){e.get("schemaDef").get("dbType").get("context")=="browser"?window.browserEngines[e.get("schemaDef").get("dbType").get("className")].executeQuery({sql:e.get("sql"),statement_separator:e.get("statement_separator"),success:function(n){e.set({id:t.ID,sets:n}),e.trigger("executed")},error:function(t){e.set({sets:[{SUCCEEDED:!1,ERRORMESSAGE:t}]}),e.trigger("executed")}}):e.set({id:t.ID,sets:t.sets})},error:function(t,n,r){e.set({sets:[]})},complete:function(t,n){e.trigger("executed")}})}}),a=Backbone.View.extend({initialize:function(){this.compiledTemplate=Handlebars.compile(this.options.template.html())},events:{"click ul.dropdown-menu li":"clickDBType"},clickDBType:function(e){e.preventDefault(),this.collection.setSelectedType($(e.currentTarget).attr("db_type_id"))},render:function(){var e=this.collection.getSelectedType();return $(this.el).html(this.compiledTemplate({dbTypes:this.collection.map(function(e){var t=e.toJSON();return t.className=t.selected?"active":"",t}),selectedFullName:e.get("full_name")})),$("#db_type_label_collapsed .navbar-text").text(e.get("full_name")),this}}),f=Backbone.View.extend({initialize:function(){this.editor=CodeMirror.fromTextArea(document.getElementById(this.id),{mode:"mysql",extraKeys:{Tab:"indentMore"},lineNumbers:!0,onChange:this.handleSchemaChange}),this.compiledOutputTemplate=Handlebars.compile(this.options.outputTemplate.html()),this.compiledSchemaBrowserTemplate=Handlebars.compile(this.options.schemaBrowserTemplate.html())},handleSchemaChange:function(){var e=window.schemaDefView;if(e.model.get("ddl")!=e.editor.getValue()||e.model.get("statement_separator")!=$(".panel.schema .terminator").data("statement_separator"))e.model.set({ddl:e.editor.getValue(),statement_separator:$(".panel.schema .terminator").data("statement_separator"),ready:!1}),$(".schema .helpTip").css("display",e.model.get("ddl").length?"none":"block"),$(".sql .helpTip").css("display",!e.model.get("ready")||e.model.get("loading")?"none":"block")},render:function(){this.editor.setValue(this.model.get("ddl")),this.updateDependents(),e($(".panel.schema"),this.model.get("statement_separator"))},renderOutput:function(){this.options.output_el.html(this.compiledOutputTemplate(this.model.toJSON()))},renderSchemaBrowser:function(){this.options.browser_el.html(this.compiledSchemaBrowserTemplate({objects:this.model.get("schema_structure")}))},refresh:function(){this.editor.refresh()},updateDependents:function(){this.model.get("ready")?($(".needsReadySchema").unblock(),$("#schemaBrowser").attr("disabled",!1),$(".schema .helpTip").css("display","none"),$(".sql .helpTip").css("display",this.model.get("loading")||window.query.get("sql").length?"none":"block")):($(".needsReadySchema").block({message:"Please build schema."}),$("#schemaBrowser").attr("disabled",!0),$(".schema .helpTip").css("display",this.model.get("loading")||this.model.get("ddl").length?"none":"block"))}}),l=Backbone.View.extend({initialize:function(){this.editor=CodeMirror.fromTextArea(document.getElementById(this.id),{mode:"mysql",extraKeys:{Tab:"indentMore"},lineNumbers:!0,onChange:this.handleQueryChange}),this.outputType="tabular",this.compiledOutputTemplate={},this.compiledOutputTemplate.tabular=Handlebars.compile(this.options.tabularOutputTemplate.html()),this.compiledOutputTemplate.plaintext=Handlebars.compile(this.options.plaintextOutputTemplate.html())},setOutputType:function(e){this.outputType=e},handleQueryChange:function(){var e=window.queryView,t=e.model.get("schemaDef");e.model.set({sql:e.editor.getValue()}),$(".sql .helpTip").css("display",!t.get("ready")||t.get("loading")||e.model.get("sql").length?"none":"block")},render:function(){this.editor.setValue(this.model.get("sql")),this.model.id&&this.renderOutput(),e($(".panel.sql"),this.model.get("statement_separator"))},renderOutput:function(){var e=this.model,t=this.model.toJSON();_.each(t.sets,function(e,n){if(e.RESULTS){var r=_.map(e.RESULTS.COLUMNS,function(e){return e.length});_.each(e.RESULTS.DATA,function(e){r=_.map(e,function(e,t){return _.max([e.toString().length,r[t]])})}),t.sets[n].RESULTS.COLUMNWIDTHS=r}}),t.schemaDef=this.model.get("schemaDef").toJSON(),t.schemaDef.dbType=this.model.get("schemaDef").get("dbType").toJSON(),this.options.output_el.html(this.compiledOutputTemplate[this.outputType](t)),$("script.oracle_xplan_xml").each(function(){$(this).siblings("div.oracle_xplan").html(loadswf($(this).text()))}),this.options.output_el.find("a.executionPlanLink").click(function(t){t.preventDefault(),$("i",this).toggleClass("icon-minus icon-plus"),$(this).closest(".set").find(".executionPlan").toggle(),$("i",this).hasClass("icon-minus")&&e.get("schemaDef").get("dbType").get("simple_name")=="SQL Server"&&QP.drawLines($(this).closest(".set").find(".executionPlan div"))})},refresh:function(){this.editor.refresh()},checkForSelectedText:function(){this.editor.somethingSelected()?this.model.set("sql",this.editor.getSelection()):this.model.set("sql",this.editor.getValue())}});window.browserEngines={websql:new WebSQL_driver,sqljs:new SQLjs_driver},window.myFiddleHistory=new r,window.dbTypes=new s,window.schemaDef=new o,window.query=new u({schemaDef:window.schemaDef}),window.dbTypesListView=new a({el:$("#db_type_id")[0],collection:window.dbTypes,template:$("#db_type_id-template")}),window.schemaDefView=new f({id:"schema_ddl",model:window.schemaDef,outputTemplate:$("#schema-output-template"),output_el:$("#output"),schemaBrowserTemplate:$("#schema-browser-template"),browser_el:$("#browser")}),window.queryView=new l({id:"sql",model:window.query,tabularOutputTemplate:$("#query-tabular-output-template"),plaintextOutputTemplate:$("#query-plaintext-output-template"),output_el:$("#output")}),window.dbTypes.on("change",function(){window.dbTypesListView.render(),window.schemaDef.has("dbType")&&window.schemaDef.set("ready",window.schemaDef.get("dbType").id==this.getSelectedType().id)}),window.schemaDef.on("change",function(){this.hasChanged("ready")&&window.schemaDefView.updateDependents(),this.hasChanged("errorMessage")&&window.schemaDefView.renderOutput(),this.hasChanged("schema_structure")&&window.schemaDefView.renderSchemaBrowser()}),window.schemaDef.on("reloaded",function(){this.set("dbType",window.dbTypes.getSelectedType()),window.schemaDefView.render()}),window.query.on("reloaded",function(){this.set({pendingChanges:!1},{silent:!0}),window.queryView.render()}),window.schemaDef.on("built failed",function(){$("#buildSchema label").prop("disabled",!1),$("#buildSchema label").html($("#buildSchema label").data("originalValue")),window.schemaDefView.renderOutput(),window.schemaDefView.renderSchemaBrowser()}),window.query.on("change",function(){(this.hasChanged("sql")||this.hasChanged("statement_separator"))&&!this.hasChanged("id")&&!this.get("pendingChanges")&&this.set({pendingChanges:!0},{silent:!0})}),window.query.on("executed",function(){var e=$(".runQuery");e.prop("disabled",!1),e.html(e.data("originalValue")),this.set({pendingChanges:!1},{silent:!0}),window.queryView.renderOutput()}),$("#buildSchema").click(function(e){var t=$("label",this);e.preventDefault();if(t.prop("disabled"))return!1;t.data("originalValue",t.html()),t.prop("disabled",!0).text("Building Schema..."),window.schemaDef.build()});var c=function(e){var t=$(".runQuery");e.preventDefault();if(t.prop("disabled"))return!1;t.data("originalValue",t.html()),t.prop("disabled",!0).text("Executing SQL..."),window.queryView.checkForSelectedText(),window.query.execute()};$(".runQuery").click(c),$(document).keyup(function(e){e.keyCode==116&&(e.preventDefault(),c(e))}),$("#runQueryOptions li a").click(function(e){e.preventDefault(),window.queryView.setOutputType(this.id),window.queryView.renderOutput()}),$("#queryPrettify").click(function(e){var t=$(this);t.attr("disabled",!0),e.preventDefault(),$.post("index.cfm/proxy/formatSQL",{sql:window.query.get("sql")},function(e){window.query.set({sql:e}),window.query.trigger("reloaded"),window.query.set({pendingChanges:!0}),t.attr("disabled",!1)})}),$("#clear").click(function(e){e.preventDefault(),window.schemaDef.reset(),window.query.reset(),window.router.navigate("!"+window.dbTypes.getSelectedType().id,{trigger:!0})}),$("#sample").click(function(e){e.preventDefault(),window.router.navigate("!"+window.dbTypes.getSelectedType().get("sample_fragment"),{trigger:!0})}),$(".terminator .dropdown-menu a").on("click",function(t){t.preventDefault(),e($(this).closest(".panel"),$(this).attr("href")),$(this).closest(".panel").hasClass("schema")?window.schemaDefView.handleSchemaChange():window.query.set({pendingChanges:!0,statement_separator:$(this).attr("href")},{silent:!0})}),$(window).bind("beforeunload",function(){if(window.query.get("pendingChanges"))return"Warning! You have made changes to your query which will be lost. Continue?'"}),window.dbTypes.on("reset",function(){window.router=new t,Backbone.history.start({pushState:!1}),this.length&&!this.getSelectedType()&&this.setSelectedType(this.first().id,!0),window.dbTypesListView.render(),window.schemaDefView.render(),window.queryView.render()}),window.myFiddleHistory.on("change reset remove",function(){localStorage&&localStorage.setItem("fiddleHistory",JSON.stringify(this.toJSON()))}),window.dbTypes.on("change",function(){window.dbTypesListView.render(),window.query.id&&window.schemaDef.get("short_code").length&&window.schemaDef.get("dbType").id==this.getSelectedType().id?window.router.navigate("!"+this.getSelectedType().id+"/"+window.schemaDef.get("short_code")+"/"+window.query.id):window.schemaDef.get("short_code").length&&window.schemaDef.get("dbType").id==this.getSelectedType().id?window.router.navigate("!"+this.getSelectedType().id+"/"+window.schemaDef.get("short_code")):window.router.navigate("!"+this.getSelectedType().id)}),window.schemaDef.on("built",function(){window.myFiddleHistory.insert(new n({fragment:"!"+this.get("dbType").id+"/"+this.get("short_code")})),window.router.navigate("!"+this.get("dbType").id+"/"+this.get("short_code"))}),window.query.on("executed",function(){var e=this.get("schemaDef");window.myFiddleHistory.insert(new n({fragment:"!"+e.get("dbType").id+"/"+e.get("short_code")+"/"+this.id})),window.router.navigate("!"+e.get("dbType").id+"/"+e.get("short_code")+"/"+this.id)})}),Handlebars.registerHelper("result_display",function(e){return $.isPlainObject(e)?JSON.stringify(e):e==null?"(null)":e===!1?"false":e}),Handlebars.registerHelper("each_simple_value_with_index",function(e,t){var n="";k=0;for(var r=0,i=e.length;r<i;r++){var s={value:e[r]};s.index=k,s.first=k==0,s.last=k==e.length,n+=t(s),k++}return n}),Handlebars.registerHelper("result_display_padded",function(e){var t=[];return t.length=e[this.index]-this.value.toString().length+1,t.join(" ")+this.value.toString()}),Handlebars.registerHelper("divider_display",function(e){var t=[];return t.length=e[this.index]+1,t.join("-")})