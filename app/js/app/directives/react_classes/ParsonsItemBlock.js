define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock) {
        return React.createClass({

            getInitialState: function() {
                return {
                    editing: false,
                    editedValue: this.props.doc.value,
                };
            },

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onIDChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.id = e.target.value;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onValueChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = e.target.value;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onRemoveClicked: function(e) {
                var index = this.props.key;
                this.props.onRemoveClicked(index);
            },

            render: function() {
                return (
                    <div className="row">
                        <div className="small-1 column">
                            <input value={this.props.doc.id} onChange={this.onIDChange} placeholder="Item ID" />
                        </div>
                        <div className="small-8 columns">
                            <input value={this.props.doc.value} onChange={this.onValueChange} placeholder="e.g., x = 1" />
                        </div>
                        <div className="small-1 column end">
                            <button className={"button tiny tag radius alert"} onClick={this.onRemoveClicked}><i className="foundicon-remove"/></button>
                        </div>
                    </div>
                )
            }
        });
    }
})