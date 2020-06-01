define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, FigureBlock) {
        return React.createClass({

            getInitialState: function() {
                this.props.doc.tags = {
                    "localhost:8421": ["physics"],
                    "editor.isaacphysics.org": ["physics"],
                    "editor.isaaccomputerscience.org": ["news"]
                }[document.location.host];
                return {
                    value: this.props.doc.value,
                    tags: this.props.doc.tags
                }
            },

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onValueChange: function(e) {
                this.setState({
                    value: e.target.value,
                });

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.value = e.target.value;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onUrlChange: function(e) {
                this.setState({
                    url: e.target.value,
                });

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.url = e.target.value;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onImageChange: function(c, oldVal, newVal) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.image = newVal;

                this.onDocChange(this, oldDoc, newDoc);
            },

            render: function() {
                return (
                    <Block type="pod" blockTypeTitle="Pod" doc={this.props.doc} onChange={this.onDocChange}>
                    <form>
                    <div className="row">
                        <div className="small-12 columns plain-text-content">
                        <label for="valueTextBox">Pod Text: </label><input id="valueTextBox" type="text" value={this.props.doc.value} onChange={this.onValueChange} placeholder="Pod Text"/>
                    </div>
                    <div className="small-12 columns">
                        <label for="urlTextBox">Url: </label><input id="urlTextBox" type="text" value={this.props.doc.url} onChange={this.onUrlChange} placeholder="Pod Link Url"/>
                    </div>
                    <div className="small-12 columns">
                    <FigureBlock doc={this.props.doc.image} onChange={this.onImageChange} />
                    </div>
                    </div>
                    </form>
                    </Block>
            );
            }
        });
    }
})
