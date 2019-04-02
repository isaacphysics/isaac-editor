define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock, ParsonsItemBlock) {
        return React.createClass({

            getInitialState: function() {
                return {
                    editing: false,
                    editedValue: this.props.doc.value,
                    editedPythonExpression: this.props.doc.pythonExpression
                };
            },

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onContentChange: function(c, oldVal, newVal, oldPythonExpression, newPythonExpression) {
                // newVal could be a string or a list.
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = newVal;
                newDoc.pythonExpression = newPythonExpression;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onExplanationChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.explanation = newVal;

                this.onDocChange(this, oldDoc, newDoc);
            },

            correct_toggle: function(e) {

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);

                newDoc.correct = !oldDoc.correct;

                this.onDocChange(this, oldDoc, newDoc);
            },

            render: function() {

                var emptyExplanation = {
                    type: "content",
                    children: [],
                    encoding: "markdown"
                };

                var parsonsItemsListItems = [];
                for (const index in this.props.doc.items) {
                    const element = this.props.doc.items[index];
                    const div = (<div>
                        <Block key={index}>
                            <ParsonsItemBlock doc={element} key={index} mode="choice" onChange={this.onParsonsItemsChange} onRemoveClicked={this.removeParsonsItemAtIndex} />
                        </Block>
                    </div>);
                    parsonsItemsListItems.push(div);
                }
                debugger;

                var content = <div ref="content">
                    {parsonsItemsListItems}
                </div>

                return (
                    <Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="row">
                            <div className="small-1 column text-right">
                                {this.props.doc.correct ?
                                    <i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
                                    <i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
                            </div>
                            <div className="small-7 columns" >
                                {content}
                            </div>
                            <div className="small-4 columns" >
                                <ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
                            </div>
                        </div>
                    </Block>
                );
            }
        });
    }
})
