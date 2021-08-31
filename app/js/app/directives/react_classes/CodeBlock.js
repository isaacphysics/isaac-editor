define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentValueOrChildren) {
        return React.createClass({

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onCheckboxChange: function(key, e) {
                console.log("New checkbox state:", e.target.checked, "for key:", key);

                // newVal must be a doc
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc[key] = e.target.checked;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onCodeChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.code = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onLanguageStyleChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.language = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onUrlChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.url = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            render: function() {

                return (
                    <Block type="codeSnippet" blockTypeTitle="CodeSnippet" doc={this.props.doc} onChange={this.onDocChange}>
                        <div>
                            <label>Language Style:</label>
                            <select value={this.props.doc.language} onChange={this.onLanguageStyleChange}>
                                <option value="python">Python</option>
                                <option value="javascript">Javascript</option>
                                <option value="csharp">C#</option>
                                <option value="php">PHP</option>
                                <option value="sql">SQL</option>
                                <option value="pseudocode">Isaac Pseudocode</option>
                            </select>
                        </div>
                        <div ref="disableHighlightingCheckbox">
                            <label><input type="checkbox" checked={this.props.doc.disableHighlighting} onChange={this.onCheckboxChange.bind(this, "disableHighlighting")} />Disable Highlighting</label>
                        </div>
                        <div>
                            <label>Code:</label>
                            <textarea style={{fontFamily: "monospace"}} value={this.props.doc.code || ''} rows="10" onChange={this.onCodeChange}></textarea>
                        </div>
                        <div>
                            <label>Url:</label>
                            <input type="text" value={this.props.doc.url} onChange={this.onUrlChange} placeholder="Url" />
                        </div>
                    </Block>
                );
            }
        });
    }
})
