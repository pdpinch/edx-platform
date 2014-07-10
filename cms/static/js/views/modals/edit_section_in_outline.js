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
            },


            // getDateTime: function(datetime) {
            //     var date, time;

            //     date = date.parse(datetime.split(' at ')[0]).toString('mm', 'dd', 'YY');
            //     time = date.parse(datetime.split(' at ')[1].split('UTC')[0]).toString('hh', 'mm');

            //     return date, time
            // },


            getContentHtml: function() {
                debugger
                return this.template({
                    xblockInfo: this.xblockInfo,
                    // getDateTime: this.getDateTime,
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
