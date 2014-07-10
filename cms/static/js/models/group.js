define([
    'backbone', 'underscore', 'underscore.string', 'gettext',
    'backbone.associations'
], function(Backbone, _, str, gettext) {
    'use strict';
    _.str = str;
    var Group = Backbone.AssociatedModel.extend({
        defaults: function() {
            return { name: null };
        },

        initialize: function () {
            // Update name if it is default. We cannot set name in `defaults`,
            // because model doesn't have access to collection when `defaults`
            // is processed.
            if (_.isNull(this.get('name')) && this.collection) {
                this.set('name', this.getDefaultName(), { silent: true });
            }
        },

        isEmpty: function() {
            return !this.get('name');
        },

        toJSON: function() {
            return { name: this.get('name') };
        },

        validate: function(attrs) {
            if (!_.str.trim(attrs.name)) {
                return {
                    message: gettext(''),
                    attributes: { name: true }
                };
            }
        },

        /*
         * Return default name for the group.
         * @return {String}
         * @examples
         * Group A, Group B, Group AA, Group ZZZ etc.
         */
        getDefaultName: function () {
            var index = this.isNew() ? this.collection.length : index,
                usedNames = _.pluck(this.collection.toJSON(), 'name'),
                name, groupId;

            do {
                groupId = this.getGroupId(index);
                name = _.str.sprintf(gettext('Group %s'), groupId);
                index ++;
            } while (_.contains(usedNames, name));

            return name;
        },

        /*
         * Return group id for the default name of the group.
         * @param {Number} number Current index of the model in the collection.
         * @return {String}
         * @examples
         * For example: A, B, AA in Group A, Group B, ..., Group AA, etc.
         */
        getGroupId: (function () {
            /*
                Translators: Dictionary used for creation ids that are used in
                default group names. For example: A, B, AA in Group A,
                Group B, ..., Group AA, etc.
            */
            var dict = gettext('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split(''),
                len = dict.length;

            var divide = function(numerator, denominator) {
                if (!_.isNumber(numerator) || !denominator) {
                    return null;
                }

                return {
                    quotient: numerator/denominator,
                    remainder: numerator % denominator
                };
            };

            return function getId(number) {
                var id = '',
                    result = divide(number, len),
                    index;

                if (result) {
                    index = Math.floor(result.quotient - 1);

                    if (index < len) {
                      if (index > -1) {
                        id += dict[index];
                      }
                    } else {
                        id += getId(index);
                    }

                    return id + dict[result.remainder];
                }

                return String(number);
            };
        }())
    });

    return Group;
});
