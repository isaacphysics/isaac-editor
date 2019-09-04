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
                this.onDocChange(this, oldDoc, newDoc);
            },

            onExplanationChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.explanation = newVal;
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
                var emptyExplanation = {
                    type: "content",
                    children: [],
                    encoding: "markdown"
                };
                return (
                    <Block type="glossaryTerm" blockTypeTitle="Glossary term" doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="small-3 columns">
                            <div className="row">
                                <input type="text" value={this.props.doc.value} onChange={this.onContentChange} placeholder="Glossary term"/>
                            </div>
                        </div>
                        <div className="small-9 columns" >
                            <ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
                        </div>
                    </Block>
                );
            }
        })
    }
})
