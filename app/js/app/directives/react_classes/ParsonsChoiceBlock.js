define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock, ParsonsItemBlock) {
        return React.createClass({

            getInitialState: function() {
                return {
                    editing: false,
                    // editedValue: this.props.doc.value,
                    // editedPythonExpression: this.props.doc.pythonExpression
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

            onParsonsChoiceChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                
                newDoc.items[c.props.key] = newVal;

                this.onDocChange(this, oldDoc, newDoc);
            },

            removeParsonsChoiceItemAtIndex: function(index) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);

                newDoc.items.splice(index, 1);

                this.onDocChange(this, oldDoc, newDoc);
            },

            addParsonsChoiceItem: function() {
				if (this.props.globalItems) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					newDoc.items.push({
						"type": "parsonsItem",
						"indentation": 0,
						"id": this.props.globalItems[0].id,
					});
					this.onDocChange(this, oldDoc, newDoc);
				} else {
					console.log("No global Parson's items present")
				}
			},

            render: function() {

                var emptyExplanation = {
                    type: "content",
                    children: [],
                    encoding: "markdown"
                };

                const globalItemsIdToValue = [];
                for (const item of this.props.globalItems) {
                    globalItemsIdToValue[item.id] = item.value;
                }
                const globalItemIDs = this.props.globalItems.map(function(item) { return item.id });

                var parsonsChoiceItems = [];
                const choice = this.props.doc;
                for (const choiceItemIdx in choice.items) {
                    const item = choice.items[choiceItemIdx];
                    const block = <ParsonsItemBlock
                        doc={item} key={choiceItemIdx} mode="choice" value={globalItemsIdToValue[item.id]}
                        itemIDs={globalItemIDs} onChange={this.onParsonsChoiceChange}
                        onRemoveClicked={this.removeParsonsChoiceItemAtIndex}
                    />;
                    parsonsChoiceItems.push(block);
                }

                var content = <div ref="content">
                    {parsonsChoiceItems}
                </div>;

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
                                <div className="row">
                                    <div className="small-10 columns">&nbsp;</div>
                                    <div className="small-1 column end">
                                        <button className={"button tiny tag radius success"} onClick={this.addParsonsChoiceItem}><i className="foundicon-plus" /></button>	
                                    </div>
                                </div>
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
