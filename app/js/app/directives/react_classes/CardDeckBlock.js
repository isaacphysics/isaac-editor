define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentChildren) {
        return React.createClass({

            getInitialState: function() {
                if (!this.props.doc.tags || this.props.doc.tags === []) {
                    this.props.doc.tags = {
                        "localhost:8421": ["physics"],
                        "editor.isaacphysics.org": ["physics"],
                        "editor.isaaccomputerscience.org": []
                    }[document.location.host];
                }
                return {
                    value: this.props.doc.value,
                    tags: this.props.doc.tags
                }
            },

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onCardsChange: function(c, oldChildren, newChildren) {
                // newVal must be a list
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.cards = newChildren;

                this.onDocChange(this, oldDoc, newDoc)
            },

            render: function() {
                return (
                    <Block type="cardDeck" blockTypeTitle="Card Deck" doc={this.props.doc} onChange={this.onDocChange}>
                    <form>
                    <div className="row">
                    <div className="small-12 columns plain-text-content">
                    <ContentChildren items={this.props.doc.cards} encoding={this.encoding} onChange={this.onCardsChange} requiredChildType={"isaacCard"}/>
                    </div>
                    </div>
                    </form>
                    </Block>
            );
            }
        });
    }
})
