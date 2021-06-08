define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, VariantBlock, ContentChildren, ContentValueOrChildren, TabsBlock, ParsonsItemBlock, ParsonsChoiceBlock) {
        return React.createClass({

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onContentChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onIdChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.id = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            toggle: function(attribute) {
                return function() {
                    var oldDoc = this.props.doc;
                    var newDoc = $.extend({}, oldDoc);
                    newDoc[attribute] = !oldDoc[attribute];
                    this.onDocChange(this, oldDoc, newDoc);
                }.bind(this);
            },

			onTagsChange: function(c, oldTags, newTags) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.tags = newTags;
				this.onDocChange(this, oldDoc, newDoc);
			},

            render: function() {
                return (
                    <b>IsaacQuizSection</b>
                );
            }
        })
    }
})
