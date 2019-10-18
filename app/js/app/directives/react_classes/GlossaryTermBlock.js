define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock) {
        return React.createClass({

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onContentChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = e.target.value;
                if (newDoc.autoId) {
                    newDoc.id = e.target.value.toLowerCase().replace(/[^\w]/g, '-');
                }
                this.onDocChange(this, oldDoc, newDoc);
            },

            onExplanationChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.explanation.value = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onAutoIdToggle: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.autoId = !newDoc.autoId;
                if (newDoc.autoId) {
                    newDoc.id = newDoc.value.toLowerCase().replace(/[^\w]/g, '-');
                }
                this.onDocChange(this, oldDoc, newDoc);
            },

            onIdChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.id = c.target.value.toLowerCase().replace(/[^\w]/g, '-');
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

            render: function() {
                if (typeof this.props.doc.autoId == 'undefined') {
                    this.props.doc.autoId = true;
                }
                return (
                    <Block type="glossaryTerm" blockTypeTitle="Glossary term" doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="small-3 columns">
                            <div className="row">
                                <input type="text" value={this.props.doc.value} onChange={this.onContentChange} placeholder="Glossary term" />
                                <input type="checkbox" checked={this.props.doc.autoId} onChange={this.onAutoIdToggle} /><label>Automatic IDs</label>
                                {this.props.doc.autoId && <p>ID: {this.props.doc.id}</p>}
                                {!this.props.doc.autoId && <input type="text" value={this.props.doc.id} onChange={this.onIdChange} placeholder="ID" />}
                            </div>
                        </div>
                        <div className="small-9 columns" >
                            <textarea value={this.props.doc.explanation.value || ''} rows="6" onChange={this.onExplanationChange}></textarea>
                        </div>
                    </Block>
                );
            }
        })
    }
})
