define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentValueOrChildren) {
        return React.createClass({

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onContentChange: function(c, oldVal, newVal, oldChildren, newChildren) {
                // newVal could be a string or a list.
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = newVal;
                newDoc.children = newChildren;

                this.onDocChange(this, oldDoc, newDoc);
            },

            render: function() {

                return (
                    <Block type="isaacQuizRubric" blockTypeTitle="Quiz Rubric" doc={this.props.doc} onChange={this.onDocChange}>
                        <div className="quiz-rubric">
                            <ContentValueOrChildren children={this.props.doc.children} onChange={this.onContentChange}/>
                        </div>
                    </Block>
                );
            }
        });
    }
})
