define(["jquery", "underscore", "gettext", "js/views/xblock_outline", "js/views/utils/view_utils"],
    function($, _, gettext, XBlockOutlineView, ViewUtils) {

        var CourseOutlineView = XBlockOutlineView.extend({
            // takes XBlockOutlineInfo as a model

            templateName: 'course-outline',

            shouldExpandChildren: function() {
                // Expand the children if this xblock's locator is in the initially expanded state
                if (this.initialState && _.indexOf(this.initialState.expanded_locators, this.model.id) >= 0) {
                    return true;
                }
                // Only expand sections initially
                var category = this.model.get('category');
                return this.renderedChildren || category === 'course' || category === 'chapter';
            },

            shouldRenderChildren: function() {
                // Render all nodes up to verticals but not below
                return this.model.get('category') !== 'vertical';
            },

            createChildView: function(xblockInfo, parentInfo, parentView) {
                return new CourseOutlineView({
                    model: xblockInfo,
                    parentInfo: parentInfo,
                    initialState: this.initialState,
                    template: this.template,
                    parentView: parentView || this
                });
            },

            getExpandedLocators: function() {
                var expandedLocators = [];
                this.$('.outline-item.is-collapsible').each(function(index, rawElement) {
                    var element = $(rawElement);
                    if (!element.hasClass('collapsed')) {
                        expandedLocators.push(element.data('locator'));
                    }
                });
                return expandedLocators;
            },

            /**
             * Refresh the containing section (if there is one) or else refresh the entire course.
             * Note that the refresh will preserve the expanded state of this view and all of its
             * children.
             * @param viewState The desired initial state of the view, or null if none.
             * @returns {*} A promise representing the refresh operation.
             */
            refresh: function(viewState) {
                var getViewToRefresh = function(view) {
                        if (view.model.get('category') === 'chapter' || !view.parentView) {
                            return view;
                        }
                        return getViewToRefresh(view.parentView);
                    },
                    view = getViewToRefresh(this),
                    expandedLocators = view.getExpandedLocators();
                viewState = viewState || {};
                viewState.expanded_locators = expandedLocators.concat(viewState.expanded_locators || []);
                view.initialState = viewState;
                return view.model.fetch({});
            },

            onChildAdded: function(locator, category) {
                // For units, redirect to the new page, and for everything else just refresh inline.
                if (category === 'vertical') {
                    ViewUtils.redirect('/container/' + locator);
                } else {
                    // Refresh the view and do the following:
                    //  - show the new block expanded
                    //  - ensure it is scrolled into view
                    //  - make its name editable
                    this.refresh({
                        locator_to_show: locator,
                        edit_display_name: locator,
                        expanded_locators: [ locator ]
                    });
                }
            }
        });

        return CourseOutlineView;
    }); // end define();
