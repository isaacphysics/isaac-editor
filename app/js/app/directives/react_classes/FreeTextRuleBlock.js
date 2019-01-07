define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock, ContentValueOrChildren) {
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
                    <Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="row">
                            <div className="small-1 columns text-center" style={{"padding-top": "18px", "font-size": "26px"}}>
                                {this.props.doc.correct ?
                                    <i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.toggle('correct')}/> :
                                    <i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.toggle('correct')} />}
                            </div>
                            <div className="small-6 columns">
                                <div className="row">
                                    <input type="text" value={this.props.doc.value} onChange={this.onContentChange} placeholder="Matching rule"/>
                                </div>
                                <div className="row" style={{padding: '0px'}}>
                                    <div className="small-3 columns" style={{padding: "2px"}}><input type="checkbox" checked={this.props.doc.caseInsensitive} onChange={this.toggle('caseInsensitive')} /> Ignore case</div>
                                    <div className="small-3 columns" style={{padding: "2px"}}><input type="checkbox" checked={this.props.doc.allowsAnyOrder} onChange={this.toggle('allowsAnyOrder')} /> Any order</div>
                                    <div className="small-3 columns" style={{padding: "2px"}}><input type="checkbox" checked={this.props.doc.allowsExtraWords} onChange={this.toggle('allowsExtraWords')} /> Extra words</div>
                                    <div className="small-3 columns" style={{padding: "2px"}}><input type="checkbox" checked={this.props.doc.allowsMisspelling} onChange={this.toggle('allowsMisspelling')} /> Misspelling</div>
                                </div>
                            </div>
                            <div className="small-5 columns" >
                                <ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
                            </div>
                        </div>
                    </Block>
                );
            }
        })
    }
})
