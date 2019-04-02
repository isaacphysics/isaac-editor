define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentBlock) {
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

            edit: function() {
                this.setState({
                    editing: true
                });

                if (ContentEditor.enableMathJax && this.refs.content)
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
            },

            done: function() {
                this.setState({
                    editing: false
                });

                this.onContentChange(this, this.props.doc.value, this.state.editedValue, this.props.doc.pythonExpression, this.state.editedPythonExpression);

                if (ContentEditor.enableMathJax && this.refs.content)
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
            },

            render: function() {

                var emptyExplanation = {
                    type: "content",
                    children: [],
                    encoding: "markdown"
                };

                // if (this.state.editing) {
                //     var content = <div ref="content">
                //         <table>
                //             <tr>
                //                 <td className="text-right">LaTeX expression:</td>
                //                 <td><input type="text" style={{display: "inline-block"}} onChange={this.setEditedValue} value={this.state.editedValue} /></td>
                //             </tr>
                //             <tr>
                //                 <td className="text-right">Python expression:</td>
                //                 <td><input type="text" style={{display: "inline-block", fontFamily: "monospace", fontSize: "1.5em"}} onChange={this.setEditedPythonExpression} value={this.state.editedPythonExpression} /></td>
                //             </tr>
                //         </table>
                //         <button onClick={this.done} className="button tiny">Done</button>
                //     </div>;
                // } else {
                //     var html = (this.props.doc.value || "") + " <pre style=\"background:#fff;margin-top:0.5em;\">PYTHON: " + (this.props.doc.pythonExpression || "") + "</pre>";

                //     if (this.props.doc.value) {
                //         var content = <span onClick={this.edit} ref="content" dangerouslySetInnerHTML={{__html: html}}></span>;
                //     } else {
                //         var content = <span onClick={this.edit} ref="content" style={{display: "block"}}> <i>Enter value and python expression here</i></span>;
                //     }
                // }

                var content = <div ref="content">
                    PARSONS CHOICE BLOCK
                </div>

                return (
                    <Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="row">
                            <div className="small-1 column text-right">
                                {this.props.doc.correct ?
                                    <i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
                                    <i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
                            </div>
                            <div className="small-6 columns" >
                                {content}
                                <pre>{this.props.doc.items}</pre>
                            </div>
                            <div className="small-5 columns" >
                                <ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
                            </div>
                        </div>
                    </Block>
                );
            }
        });
    }
})
