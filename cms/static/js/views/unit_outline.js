define(['js/views/xblock_outline'],
    function(XBlockOutlineView) {

        var UnitOutlineView = XBlockOutlineView.extend({
            // takes XBlockInfo as a model

            templateName: 'unit-outline',

            render: function() {
                XBlockOutlineView.prototype.render.call(this);
                this.renderAncestors();
                return this;
            },

            renderAncestors: function() {
                var i, listElement,
                    ancestors, ancestor, ancestorView = this,
                    previousAncestor = null;
                if (this.model.get('ancestor_info')) {
                    ancestors = this.model.get('ancestor_info').ancestors;
                    listElement = this.$('.sortable-list');
                    // Note: the ancestors are processed in reverse order because the tree wants to
                    // start at the root, but the ancestors are ordered by closeness to the unit,
                    // i.e. subsection and then section.
                    for (i=ancestors.length - 1; i >= 0; i--) {
                        ancestor = ancestors[i];
                        ancestorView = this.createChildView(ancestor, previousAncestor, ancestorView);
                        ancestorView.render();
                        listElement.append(ancestorView.$el);
                        previousAncestor = ancestor;
                        listElement = ancestorView.$('.sortable-list');
                    }
                }
                return ancestorView;
            },

            createChildView: function(xblockInfo, parentInfo, parentView) {
                return new XBlockOutlineView({
                    model: xblockInfo,
                    parentInfo: parentInfo,
                    initialState: this.initialState,
                    template: this.template,
                    parentView: parentView || this
                });
            }
        });

        return UnitOutlineView;
    }); // end define();
