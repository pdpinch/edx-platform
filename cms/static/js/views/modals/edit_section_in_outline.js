/**
 * The EditXBlockModal is a Backbone view that shows an xblock editor in a modal window.
 * It is invoked using the edit method which is passed an existing rendered xblock,
 * and upon save an optional refresh function can be invoked to update the display.
 */
define(["jquery", "underscore", "gettext", "js/views/modals/base_modal", "js/views/utils/view_utils",
    "js/models/xblock_info", "js/views/xblock_editor", "date"],
    function($, _, gettext, BaseModal, ViewUtils, XBlockInfo, XBlockEditorView, date) {
        var EditSectionXBlockModal = BaseModal.extend({
            events : {
                "click .action-save": "save",
                "click .action-modes a": "changeMode"
            },

            options: $.extend({}, BaseModal.prototype.options, {
                modalName: 'edit-xblock',
                addSaveButton: true
            }),

            initialize: function(xblockInfo) {
                BaseModal.prototype.initialize.call(this);
                this.events = _.extend({}, BaseModal.prototype.events, this.events);
                this.template = this.loadTemplate('edit-section-xblock-modal');
                this.xblockInfo = xblockInfo;
                this.date = date;

                // instrument as date and time pickers
                // timefield.timepicker({'timeFormat' : 'H:i'});
                // datefield.datepicker();
            },


            getDateTime: function(datetime) {
                var formatted_date, formatted_time;

                formatted_date = this.date.parse(datetime.split(' at ')[0]).toString('mm/dd/yy');
                formatted_time = this.date.parse(datetime.split(' at ')[1].split('UTC')[0]).toString('hh:mm');

                return {
                    'date': formatted_date,
                    'time': formatted_time,
                }
            },


            getContentHtml: function() {
                return this.template({
                    xblockInfo: this.xblockInfo,
                    getDateTime: this.getDateTime,
                    date: this.date,
                });
            },


            // save: function(event) {
            //     var self = this,
            //         editorView = this.editorView,
            //         xblockInfo = this.xblockInfo,
            //         data = editorView.getXModuleData();
            //     event.preventDefault();
            //     if (data) {
            //         ViewUtils.runOperationShowingMessage(gettext('Saving&hellip;'),
            //             function() {
            //                 return xblockInfo.save(data);
            //             }).done(function() {
            //                 self.onSave();
            //             });
            //     }
            // },

        });

        return EditSectionXBlockModal;
    });
