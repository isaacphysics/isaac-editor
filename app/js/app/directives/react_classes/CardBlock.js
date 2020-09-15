define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, FigureBlock) {
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

            onVerticalContentChange: function(e) {
                this.setState({
                    verticalContent: e.target.checked,
                });

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.verticalContent = e.target.checked;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onDisabledChange: function(e) {
                this.setState({
                    verticalContent: e.target.checked,
                });

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.verticalContent = e.target.checked;

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
                    <Block type="card" blockTypeTitle="Card" doc={this.props.doc} onChange={this.onDocChange}>
                        <form>
                            <div className="row">
                                <div className="small-12 columns">
                                    <label for="urlTextBox">Url: </label><input id="urlTextBox" type="text" value={this.props.doc.url} onChange={this.onUrlChange} placeholder="Card Link Url"/>
                                </div>
                                <div className="small-6 columns">
                                    <label for="verticalContentCheckbox">Vertical: </label><input id="verticalContentCheckbox" type="checkbox" value={this.props.doc.verticalContent} onChange={this.onVerticalContentChange}/>
                                </div>
                                <div className="small-6 columns">
                                    <label for="isDisabledCheckbox">Disabled: </label><input id="isDisabledCheckbox" type="checkbox" value={this.props.doc.disabled} onChange={this.onDisabledChange}/>
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
