define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, Tags, ContentBlock) {
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
                this.onDocChange(this, oldDoc, newDoc);
            },

            onExamBoardChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.examBoard = c.target.value;
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
                if (typeof this.props.doc.autoId == 'undefined') {
                    this.props.doc.autoId = true;
                }
                if (typeof this.props.doc.examBoard == 'undefined') {
                    this.props.doc.examBoard = '';
                }
                var tagsComponent = <Tags tags={this.props.doc.tags || []} onChange={this.onTagsChange}/>;
                return (
                    <Block type="glossaryTerm" blockTypeTitle="Glossary term" doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="small-5 columns">
                            <div className="row">
                                <div className="small-12 columns">
                                    <input type="text" value={this.props.doc.value} onChange={this.onContentChange} placeholder="Glossary term" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="small-8 columns">
                                    <label>Term ID:</label>
                                    <input type="text" value={this.props.doc.id} onChange={this.onIdChange} placeholder="Term ID" />
                                </div>
                            </div>
                        </div>
                        <div className="small-7 columns">
                            <textarea value={this.props.doc.explanation.value || ''} rows="6" onChange={this.onExplanationChange}></textarea>
                        </div>
                        <div className="small-12 columns">
                            <div className="row">
                                <div className="small-12 columns">
                                    <label>Tags:</label>
                                    {tagsComponent}
                                </div>
							</div>
                        </div>
                    </Block>
                );
            }
        })
    }
})
