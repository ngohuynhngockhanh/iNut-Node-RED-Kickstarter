/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var app_info = {
    app_id: 5,
    token: "jkdfjqlkjf2iojf23jf3jf203j09j320fj23kj23klfj3kojfi04jgio2rjgi2jr4gog24rj2lkfj2l3kfl2k3f3e0fij23r0fj212312312d12ed12323f43vrkbj"
}

var socket = io('https://app.mysmarthome.vn/application');

socket.on('connect', function() {
    //console.log("connected")
    socket.emit('register', app_info)
    
})

socket.on('disconnect', function() {
    //console.log("disconnected")
    setTimeout(function() {
        //console.log("reconnect")
        socket.connect()
    }, 2000)
})
RED.clipboard = (function() {

    var dialog;
    var dialogContainer;
    var exportNodesDialog;
    var importNodesDialog;
    var importiNutDialog;
    var inutDialog;
    var disabled = false;

    function setupDialogs() {
        dialog = $('<div id="clipboard-dialog" class="hide node-red-dialog"><form class="dialog-form form-horizontal"></form></div>')
            .appendTo("body")
            .dialog({
                modal: true,
                autoOpen: false,
                width: 500,
                resizable: false,
                buttons: [
                    {
                        id: "clipboard-dialog-cancel",
                        text: RED._("common.label.cancel"),
                        click: function() {
                            $( this ).dialog( "close" );
                        }
                    },
                    {
                        id: "clipboard-dialog-close",
                        class: "primary",
                        text: RED._("common.label.close"),
                        click: function() {
                            $( this ).dialog( "close" );
                        }
                    },
                    {
                        id: "clipboard-dialog-copy",
                        class: "primary",
                        text: RED._("clipboard.export.copy"),
                        click: function() {
                            $("#clipboard-export").select();
                            document.execCommand("copy");
                            document.getSelection().removeAllRanges();
                            RED.notify(RED._("clipboard.nodesExported"));
                            $( this ).dialog( "close" );
                        }
                    },
                    {
                        id: "clipboard-dialog-ok",
                        class: "primary",
                        text: RED._("common.label.import"),
                        click: function() {
                            RED.view.importNodes($("#clipboard-import").val(),$("#import-tab > a.selected").attr('id') === 'import-tab-new');
                            $( this ).dialog( "close" );
                        }
                    }
                ],
                open: function(e) {
                    $(this).parent().find(".ui-dialog-titlebar-close").hide();
                },
                close: function(e) {
                }
            });

        dialogContainer = dialog.children(".dialog-form");

        exportNodesDialog =
            '<div class="form-row">'+
                '<label style="width:auto;margin-right: 10px;" data-i18n="clipboard.export.copy"></label>'+
                '<span id="export-range-group" class="button-group">'+
                    '<a id="export-range-selected" class="editor-button toggle" href="#" data-i18n="clipboard.export.selected"></a>'+
                    '<a id="export-range-flow" class="editor-button toggle" href="#" data-i18n="clipboard.export.current"></a>'+
                    '<a id="export-range-full" class="editor-button toggle" href="#" data-i18n="clipboard.export.all"></a>'+
                '</span>'+
                '</div>'+
            '<div class="form-row">'+
                '<textarea readonly style="resize: none; width: 100%; border-radius: 4px;font-family: monospace; font-size: 12px; background:#f3f3f3; padding-left: 0.5em; box-sizing:border-box;" id="clipboard-export" rows="5"></textarea>'+
            '</div>'+
            '<div class="form-row" style="text-align: right;">'+
                '<span id="export-format-group" class="button-group">'+
                    '<a id="export-format-mini" class="editor-button editor-button-small toggle" href="#" data-i18n="clipboard.export.compact"></a>'+
                    '<a id="export-format-full" class="editor-button editor-button-small toggle" href="#" data-i18n="clipboard.export.formatted"></a>'+
                '</span>'+
            '</div>';

        importNodesDialog = '<div class="form-row">'+
            '<textarea style="resize: none; width: 100%; border-radius: 0px;font-family: monospace; font-size: 12px; background:#eee; padding-left: 0.5em; box-sizing:border-box;" id="clipboard-import" rows="5" placeholder="'+
            RED._("clipboard.pasteNodes")+
            '"></textarea>'+
            '</div>'+
            '<div class="form-row">'+
            '<label style="width:auto;margin-right: 10px;" data-i18n="clipboard.import.import"></label>'+
            '<span id="import-tab" class="button-group">'+
                '<a id="import-tab-current" class="editor-button toggle selected" href="#" data-i18n="clipboard.export.current"></a>'+
                '<a id="import-tab-new" class="editor-button toggle" href="#" data-i18n="clipboard.import.newFlow"></a>'+
            '</span>'+
            '</div>';
        importiNutDialog = '<div class="form-row">'+
            
            '</div>'+
            '<div style="text-align:center">'+
            '<span data-i18n="inut.qrcode_description"></span><div></div>'+
            '<div id="qrcode"></div>'+
            '</div>';

        inutDialog = '<div class="form-row">'+
            '<div class="palette-editor-tab hide" style="display: block; height: 550px;">' +
               '<div class="palette-search">'+
                  '<div class="red-ui-searchBox-container"><i class="fa fa-search"></i><input class="inut-search" type="text" data-i18n="[placeholder]inut.search"><a href="#" style="display: none;"><i class="fa fa-times"></i></a><span class="red-ui-searchBox-resultCount hide" style="display: inline;">0</span></div>'+
               '</div>'+
               '<div class="red-ui-editableList" style="height: 500px;top: 78px; left: 0px; bottom: 0px; right: 0px; position: absolute;">'+
                  '<div class="red-ui-editableList-border red-ui-editableList-container" style="top: 0px; left: 0px; bottom: 0px; right: 0px; position: absolute; overflow-y: scroll;">'+
                     '<ol style="position: static; top: auto; bottom: auto; left: auto; right: auto; min-height: 500px; height: auto;" class="red-ui-editableList-list">'+
                        '<li>'+
                           '<div class="red-ui-editableList-item-content">'+
                              '<div class="red-ui-search-empty"></div>'+
                           '</div>'+
                        '</li>'+
                     '</ol>'+
                  '</div>'+
               '</div>'+
            '</div>'+
        '</div>';
    }


    function iNutExamples() {
        if (disabled) {
            return;
        }

        dialogContainer.empty();
        dialogContainer.append($(inutDialog));
        dialogContainer.i18n();

        $("#clipboard-dialog-ok").hide();
        $("#clipboard-dialog-cancel").show();
        $("#clipboard-dialog-close").hide();
        $("#clipboard-dialog-copy").hide();

        $(".red-ui-searchBox-resultCount").html("0")
        var spinner = RED.utils.addSpinnerOverlay(dialogContainer, true)
        var examples = []
        $('.inut-search').on('change', function() {
            var value = $(this).val()
            var count = examples.length
            var number = 0
            if (value.length > 0) {
                $(".red-ui-editableList-container ol").html(' ')
                value = change_alias(_.toLower(value))
                for (var i = 0; i < count; i++) {
                    var example = examples[i].node
                    var title = change_alias(_.toLower(example.title))
                    var body = change_alias(_.toLower(example.body))
                    if (!_.includes(_.toLower(title), value) && !_.includes(_.toLower(body), value)) {
                        continue
                    }
                    $(".red-ui-editableList-container ol").append(
                        '<li>'+
                           '<div class="red-ui-editableList-item-content">'+
                              '<div class="palette-module-header">'+
                                 '<div class="palette-module-meta"><i class="fa fa-cube"></i><span class="palette-module-name">'+example.title+'</span><a target="_blank" class="palette-module-link" href="https://inut.vn/node/'+example.nid+'"><i class="fa fa-external-link"></i></a></div>'+
                                 '<div class="palette-module-meta">'+
                                    '<div class="palette-module-description">'+example.body+'</div>'+
                                 '</div>'+
                                 '<div class="palette-module-meta"><span class="palette-module-version"><i class="fa fa-tag"></i> '+example.field_version+'</span><span class="palette-module-updated"><i class="fa fa-calendar"></i> '+example.changed+'</span></div>'+
                                 '<div class="palette-module-meta">'+
                                    '<div class="palette-module-button-group"><a href="#" class="editor-button editor-button-small inut-add" nid="'+example.nid+'">'+RED._('inut.addExample')+'</a></div>'+
                                 '</div>'+
                              '</div>'+
                           '</div>'+
                        '</li>'
                    )
                    
                    number++
                    
                }
                $(".inut-add").click(function() {
                    var nid = $(this).attr('nid')
                    var spinner = RED.utils.addSpinnerOverlay(dialogContainer, true)
                    $.getJSON("https://inut.vn/node-red/" + nid, {_: new Date().getTime()},function(value) {
                        try {
                            var example = value.nodes[0].node
                            
                            RED.view.importNodes(example.JSON)    

                            dialog.dialog("close")
                        } catch(e) {
                            alert("ERROR, please contact to example's author!")
                            console.error(e)
                        }
                    })
                    
                })
            }
            $(".red-ui-searchBox-resultCount").html(number)
        })
        $.getJSON("https://inut.vn/node-red", {_: new Date().getTime()},function(value) {
            spinner.remove();
            examples = value.nodes
            var count = examples.length
            $(".red-ui-searchBox-resultCount").html(count)
            $('.red-ui-search-empty').html(RED._('palette.editor.moduleCount',{count:count}))

            /*
            */
            
        }).fail(function(jqxhr, textStatus, error) {
            console.log(error)
            spinner.remove();
            $(".red-ui-searchBox-resultCount").html("error")
        })

        dialog.dialog("option","title",RED._("inut.examples")).dialog("open");
    }

    function validateImport() {
        var importInput = $("#clipboard-import");
        var v = importInput.val();
        v = v.substring(v.indexOf('['),v.lastIndexOf(']')+1);
        try {
            JSON.parse(v);
            importInput.removeClass("input-error");
            importInput.val(v);
            $("#clipboard-dialog-ok").button("enable");
        } catch(err) {
            if (v !== "") {
                importInput.addClass("input-error");
            }
            $("#clipboard-dialog-ok").button("disable");
        }
    }

    function importNodes() {
        if (disabled) {
            return;
        }
        dialogContainer.empty();
        dialogContainer.append($(importNodesDialog));
        dialogContainer.i18n();

        $("#clipboard-dialog-ok").show();
        $("#clipboard-dialog-cancel").show();
        $("#clipboard-dialog-close").hide();
        $("#clipboard-dialog-copy").hide();
        $("#clipboard-dialog-ok").button("disable");
        $("#clipboard-import").keyup(validateImport);
        $("#clipboard-import").on('paste',function() { setTimeout(validateImport,10)});

        $("#import-tab > a").click(function(evt) {
            evt.preventDefault();
            if ($(this).hasClass('disabled') || $(this).hasClass('selected')) {
                return;
            }
            $(this).parent().children().removeClass('selected');
            $(this).addClass('selected');
        });

        dialog.dialog("option","title",RED._("clipboard.importNodes")).dialog("open");
    }
    function makeid(length) {
        length = length || 10
        var text = "";
        var possible = "1234567890-=qwertyuiop[]~!@#$%^&*()_+{}|:\"QWERTYUIOPASDFGHJKLZXCVBNM?><Masdfghjkl;'zxcvbnm,./";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    function importFromiNut() {
        if (disabled) {
            return;
        }
        dialogContainer.empty();
        dialogContainer.append($(importiNutDialog));
        dialogContainer.i18n();
        
        var myTopic = makeid(128)
        socket.emit('subscribe', myTopic)
        socket.on('subscribed', function(topic) {
            //console.log("Subscribed to", topic)
        })
        socket.on('data', function(app_info, nodes) {
            if (app_info.topic == myTopic) {             
                //console.log("app_info", "nodes")
                //console.log(app_info, nodes)   
                if (nodes.length > 0) {
                    var nodeRedNodes = [{
                        "id": "iNutMQTTBroker",
                        "type": "mqtt-broker",
                        "name": "",
                        "broker": "mqtt.mysmarthome.vn",
                        "port": "1883",
                        "clientid": "",
                        "usetls": false,
                        "compatmode": true,
                        "keepalive": "60",
                        "cleansession": true,
                        "willTopic": "",
                        "willQos": "0",
                        "willPayload": "",
                        "birthTopic": "",
                        "birthQos": "0",
                        "birthPayload": ""
                    }]
                    var y = 0
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i] 
                        var mqtt_token = "request/" + node.uuid + "/" + node.node_id + "/" + node.token
                        var api = {
                            mqtt_token: mqtt_token,
                            rest_token: "https://connect.mysmarthome.vn/api/1.0/" + mqtt_token + "/req_device_toggle",
                            rest_token_get: "https://connect.mysmarthome.vn/api/1.0/" + mqtt_token + "/req_device"
                        }
                        
                        var mqttName = "[MQTT-IN]" + node.name
                        var mqttNode = {
                            "id": makeid(16),
                            "type": "mqtt in",
                            "name": mqttName,
                            "topic": api.mqtt_token,
                            "qos": "2",
                            "broker": "iNutMQTTBroker",
                            "x": 0,
                            "y": y,
                            "wires": [
                                []
                            ]
                        }

                        var restGetName = "[REST][GET]" + node.name

                        var restGetNode = {
                            "id": makeid(16),
                            "type": "http request",
                            "name": restGetName,
                            "method": "GET",
                            "ret": "txt",
                            "url": api.rest_token_get,
                            "tls": "",
                            "x": 400,
                            "y": y,
                            "wires": [
                                []
                            ]
                        }
                        

                        var restPostName = "[REST][POST]" + node.name

                        var restPostNode = {
                            "id": makeid(16),
                            "type": "http request",
                            "name": restPostName,
                            "method": "POST",
                            "ret": "txt",
                            "url": api.rest_token,
                            "tls": "",
                            "x": 800,
                            "y": y,
                            "wires": [
                                []
                            ]
                        }

                        y += 60
                        nodeRedNodes.push(mqttNode)
                        nodeRedNodes.push(restGetNode)
                        nodeRedNodes.push(restPostNode)
                    }
                    //console.log(nodeRedNodes)
                    dialog.dialog("close")
                    RED.view.importNodes(JSON.stringify(nodeRedNodes))
                }
            }            
        })

        $('#qrcode').qrcode(JSON.stringify({
            app_id: 5,
            topic: myTopic
        }));

        $("#clipboard-dialog-ok").hide();
        $("#clipboard-dialog-cancel").show();
        $("#clipboard-dialog-close").hide();
        $("#clipboard-dialog-copy").hide();
        

        dialog.dialog("option","title",RED._("inut.import")).dialog("open");
    }

    
    function exportNodes() {
        if (disabled) {
            return;
        }

        dialogContainer.empty();
        dialogContainer.append($(exportNodesDialog));
        dialogContainer.i18n();
        var format = RED.settings.flowFilePretty ? "export-format-full" : "export-format-mini";

        $("#export-format-group > a").click(function(evt) {
            evt.preventDefault();
            if ($(this).hasClass('disabled') || $(this).hasClass('selected')) {
                $("#clipboard-export").focus();
                return;
            }
            $(this).parent().children().removeClass('selected');
            $(this).addClass('selected');

            var flow = $("#clipboard-export").val();
            if (flow.length > 0) {
                var nodes = JSON.parse(flow);

                format = $(this).attr('id');
                if (format === 'export-format-full') {
                    flow = JSON.stringify(nodes,null,4);
                } else {
                    flow = JSON.stringify(nodes);
                }
                $("#clipboard-export").val(flow);
                $("#clipboard-export").focus();
            }
        });

        $("#export-range-group > a").click(function(evt) {
            evt.preventDefault();
            if ($(this).hasClass('disabled') || $(this).hasClass('selected')) {
                $("#clipboard-export").focus();
                return;
            }
            $(this).parent().children().removeClass('selected');
            $(this).addClass('selected');
            var type = $(this).attr('id');
            var flow = "";
            var nodes = null;
            if (type === 'export-range-selected') {
                var selection = RED.view.selection();
                // Don't include the subflow meta-port nodes in the exported selection
                nodes = RED.nodes.createExportableNodeSet(selection.nodes.filter(function(n) { return n.type !== 'subflow'}));
            } else if (type === 'export-range-flow') {
                var activeWorkspace = RED.workspaces.active();
                nodes = RED.nodes.filterNodes({z:activeWorkspace});
                var parentNode = RED.nodes.workspace(activeWorkspace)||RED.nodes.subflow(activeWorkspace);
                nodes.unshift(parentNode);
                nodes = RED.nodes.createExportableNodeSet(nodes);
            } else if (type === 'export-range-full') {
                nodes = RED.nodes.createCompleteNodeSet(false);
            }
            if (nodes !== null) {
                if (format === "export-format-full") {
                    flow = JSON.stringify(nodes,null,4);
                } else {
                    flow = JSON.stringify(nodes);
                }
            }
            if (flow.length > 0) {
                $("#export-copy").removeClass('disabled');
            } else {
                $("#export-copy").addClass('disabled');
            }
            $("#clipboard-export").val(flow);
            $("#clipboard-export").focus();
        })

        $("#clipboard-dialog-ok").hide();
        $("#clipboard-dialog-cancel").hide();
        $("#clipboard-dialog-copy").hide();
        $("#clipboard-dialog-close").hide();
        var selection = RED.view.selection();
        if (selection.nodes) {
            $("#export-range-selected").click();
        } else {
            $("#export-range-selected").addClass('disabled').removeClass('selected');
            $("#export-range-flow").click();
        }
        if (format === "export-format-full") {
            $("#export-format-full").click();
        } else {
            $("#export-format-mini").click();
        }
        $("#clipboard-export")
            .focus(function() {
                var textarea = $(this);
                textarea.select();
                textarea.mouseup(function() {
                    textarea.unbind("mouseup");
                    return false;
                })
            });
        dialog.dialog("option","title",RED._("clipboard.exportNodes")).dialog( "open" );

        $("#clipboard-export").focus();
        if (!document.queryCommandSupported("copy")) {
            $("#clipboard-dialog-cancel").hide();
            $("#clipboard-dialog-close").show();
        } else {
            $("#clipboard-dialog-cancel").show();
            $("#clipboard-dialog-copy").show();
        }
    }

    function hideDropTarget() {
        $("#dropTarget").hide();
        RED.keyboard.remove("escape");
    }
    function copyText(value,element,msg) {
        var truncated = false;
        if (typeof value !== "string" ) {
            value = JSON.stringify(value, function(key,value) {
                if (value !== null && typeof value === 'object') {
                    if (value.__encoded__ && value.hasOwnProperty('data') && value.hasOwnProperty('length')) {
                        truncated = value.data.length !== value.length;
                        return value.data;
                    }
                }
                return value;
            });
        }
        if (truncated) {
            msg += "_truncated";
        }
        $("#clipboard-hidden").val(value).select();
        var result =  document.execCommand("copy");
        if (result && element) {
            var popover = RED.popover.create({
                target: element,
                direction: 'left',
                size: 'small',
                content: RED._(msg)
            });
            setTimeout(function() {
                popover.close();
            },1000);
            popover.open();
        }
        return result;
    }
    return {
        init: function() {
            setupDialogs();

            $('<input type="text" id="clipboard-hidden">').appendTo("body");

            RED.events.on("view:selection-changed",function(selection) {
                if (!selection.nodes) {
                    RED.menu.setDisabled("menu-item-export",true);
                    RED.menu.setDisabled("menu-item-export-clipboard",true);
                    RED.menu.setDisabled("menu-item-export-library",true);
                } else {
                    RED.menu.setDisabled("menu-item-export",false);
                    RED.menu.setDisabled("menu-item-export-clipboard",false);
                    RED.menu.setDisabled("menu-item-export-library",false);
                }
            });

            RED.actions.add("core:show-export-dialog",exportNodes);
            RED.actions.add("core:show-import-dialog",importNodes);
            RED.actions.add("core:import-inut",importFromiNut);
            RED.actions.add("core:inut-examples",iNutExamples);
            


            RED.events.on("editor:open",function() { disabled = true; });
            RED.events.on("editor:close",function() { disabled = false; });
            RED.events.on("search:open",function() { disabled = true; });
            RED.events.on("search:close",function() { disabled = false; });
            RED.events.on("type-search:open",function() { disabled = true; });
            RED.events.on("type-search:close",function() { disabled = false; });


            $('#chart').on("dragenter",function(event) {
                if ($.inArray("text/plain",event.originalEvent.dataTransfer.types) != -1 ||
                     $.inArray("Files",event.originalEvent.dataTransfer.types) != -1) {
                    $("#dropTarget").css({display:'table'});
                    RED.keyboard.add("*", "escape" ,hideDropTarget);
                }
            });

            $('#dropTarget').on("dragover",function(event) {
                if ($.inArray("text/plain",event.originalEvent.dataTransfer.types) != -1 ||
                     $.inArray("Files",event.originalEvent.dataTransfer.types) != -1) {
                    event.preventDefault();
                }
            })
            .on("dragleave",function(event) {
                hideDropTarget();
            })
            .on("drop",function(event) {
                if ($.inArray("text/plain",event.originalEvent.dataTransfer.types) != -1) {
                    var data = event.originalEvent.dataTransfer.getData("text/plain");
                    data = data.substring(data.indexOf('['),data.lastIndexOf(']')+1);
                    RED.view.importNodes(data);
                } else if ($.inArray("Files",event.originalEvent.dataTransfer.types) != -1) {
                    var files = event.originalEvent.dataTransfer.files;
                    if (files.length === 1) {
                        var file = files[0];
                        var reader = new FileReader();
                        reader.onload = (function(theFile) {
                            return function(e) {
                                RED.view.importNodes(e.target.result);
                            };
                        })(file);
                        reader.readAsText(file);
                    }
                }
                hideDropTarget();
                event.preventDefault();
            });

        },
        import: importNodes,
        export: exportNodes,
        copyText: copyText
    }
})();
function change_alias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    str = str.replace(/ + /g," ");
    str = str.trim(); 
    return str;
}