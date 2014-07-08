define(["backbone", "js/utils/module"], function(Backbone, ModuleUtils) {
    var XBlockInfo = Backbone.Model.extend({

        urlRoot: ModuleUtils.urlRoot,

        // NOTE: 'publish' is not an attribute on XBlockInfo, but it is used to signal the publish
        // and discard changes actions. Therefore 'publish' cannot be introduced as an attribute.
        defaults: {
            "id": null,
            "display_name": null,
            "category": null,
            "is_container": null,
            "data": null,
            "metadata" : null,
            "studio_url": null,
            /**
             * An optional object with information about the children as well as about
             * the primary xblock type that is supported as a child.
             */
            "child_info": null,
            /**
             * An optional object with information about each of the ancestors.
             */
            "ancestor_info": null,
            /**
             * True iff:
             * 1) Edits have been made to the xblock and no published version exists.
             * 2) Edits have been made to the xblock since the last published version.
             */
            "has_changes": null,
            /**
             * True iff a published version of the xblock exists with a release date in the past,
             * and the xblock is not locked.
             */
            "released_to_students": null,
            /**
             * True iff a published version of the xblock exists.
             */
            "published": null,
            /**
             * If true, only course staff can see the xblock regardless of publish status or
             * release date status.
             */
            "locked": null,
            /**
             * Date of last edit to this xblock. Will be the latest change to either the draft
             * or the published version.
             */
            "edited_on":null,
            /**
             * User who last edited the xblock.
             */
            "edited_by":null,
            /**
             * If the xblock is published, the date on which it will be released to students.
             */
            "release_date": null,
            /**
             * The xblock which is determining the release date. For instance, for a unit,
             * this will either be the parent subsection or the grandparent section.
             */
            "release_date_from":null,
            /**
            * If xblock is graded, the date after which student assesment will be evaluated.
            **/
            "due_date": null,
            /**
            * Grading policy for xblock
            **/
            "grading_format": null,
        },

        parse: function(response) {
            if (response.ancestor_info) {
                response.ancestor_info.ancestors = this.parseXBlockInfoList(response.ancestor_info.ancestors);
            }
            if (response.child_info) {
                response.child_info.children = this.parseXBlockInfoList(response.child_info.children);
            }
            return response;
        },

        parseXBlockInfoList: function(list) {
            var i, result = [];
            if (list) {
                for (i=0; i < list.length; i++) {
                    result.push(this.createChild(list[i]));
                }
            }
            return result;
        },

        createChild: function(response) {
            return new XBlockInfo(response, { parse: true });
        }
    });
    return XBlockInfo;
});
