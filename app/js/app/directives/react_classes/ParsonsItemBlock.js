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

            onIndentationChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.indentation = e.target.value;

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
                var element;

                if (this.props.mode === "choice") {
                    element = <div className="row">
                        <div className="small-2 column">
                            <input value={this.props.doc.id} onChange={this.onIDChange} placeholder="Item ID" />
                        </div>
                        <div className="small-2 column">
                            <input value={this.props.doc.indentation} onChange={this.onIndentationChange} placeholder="Indentation" />
                        </div>
                        <div className="small-6 column end">{"\u2001\u2001".repeat(this.props.doc.indentation) + this.props.doc.value}</div>
                    </div>;
                } else if (this.props.mode === "item") {
                    element = <div className="row">
                        <div className="small-1 column">
                            <input value={this.props.doc.id} onChange={this.onIDChange} placeholder="Item ID" />
                        </div>
                        <div className="small-8 columns">
                            <input value={this.props.doc.value} onChange={this.onValueChange} placeholder="e.g., x = 1" />
                        </div>
                        <div className="small-1 column end">
                            <button className={"button tiny tag radius alert"} onClick={this.onRemoveClicked}><i className="foundicon-remove"/></button>
                        </div>
                    </div>;
                }
                return element;
            }
        });
    }
})